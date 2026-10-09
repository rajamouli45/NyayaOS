import { MCPManager } from '../mcp-manager/index.js';

// Cache Helper
class SimpleCache {
    private store = new Map<string, { val: any, expires: number }>();
    get(key: string): any {
        const item = this.store.get(key);
        if (!item) return null;
        if (Date.now() > item.expires) {
            this.store.delete(key);
            return null;
        }
        return item.val;
    }
    set(key: string, val: any, ttlMs: number): void {
        this.store.set(key, { val, expires: Date.now() + ttlMs });
    }
}

const cache = new SimpleCache();

// Resilient API Call Wrappers (Retry + Timeout + Logging)
async function callMcpToolWithResilience(
    serviceName: string,
    toolName: string,
    args: any,
    timeoutMs = 5000,
    retries = 3,
    delayMs = 1000
): Promise<any> {
    const start = Date.now();
    let attempt = 0;

    const executeCall = async (): Promise<any> => {
        attempt++;
        const client = MCPManager.getInstance().getClient(serviceName);

        // Wrap call in Timeout check
        return Promise.race([
            client.callTool({ name: toolName, arguments: args }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeoutMs))
        ]);
    };

    while (attempt < retries) {
        try {
            const res = await executeCall();
            const duration = Date.now() - start;

            // Structured JSON logs
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                service: serviceName,
                tool: toolName,
                durationMs: duration,
                attempt,
                status: 'SUCCESS'
            }));

            return res;
        } catch (err: any) {
            const duration = Date.now() - start;
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                service: serviceName,
                tool: toolName,
                durationMs: duration,
                attempt,
                status: 'RETRYING',
                error: err.message || err
            }));

            if (attempt >= retries) {
                console.error(JSON.stringify({
                    timestamp: new Date().toISOString(),
                    service: serviceName,
                    tool: toolName,
                    status: 'FAILED',
                    error: err.message || err
                }));
                throw err;
            }
            await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
        }
    }
}

// 1. Identity Service
export class IdentityService {
    static async verifyIdentity(citizenId: string) {
        const res = await callMcpToolWithResilience('identity', 'verifyIdentity', { citizenId });
        return res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
    }

    static async validateCitizen(citizenId: string, address: string) {
        const res = await callMcpToolWithResilience('identity', 'validateCitizen', { citizenId, address });
        return res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
    }

    static async extractProfile(citizenId: string) {
        const res = await callMcpToolWithResilience('identity', 'extractProfile', { citizenId });
        return res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
    }
}

// 2. Document Service
export class DocumentService {
    static async uploadDocument(fileName: string, contentBase64: string) {
        const res = await callMcpToolWithResilience('document', 'uploadDocument', { fileName, contentBase64 });
        return res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
    }

    static async parsePdf(fileName: string) {
        const res = await callMcpToolWithResilience('document', 'parsePdf', { fileName });
        return res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
    }

    static async checkRequired(documents: string[], requiredType: string) {
        const res = await callMcpToolWithResilience('document', 'checkRequired', { documents, requiredType });
        return res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
    }

    static async detectMissing(documents: string[], requiredList: string[]) {
        const res = await callMcpToolWithResilience('document', 'detectMissing', { documents, requiredList });
        return res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
    }
}

// 3. Registry Service
export class RegistryService {
    static async checkJurisdiction(plotId: string, location: string) {
        const res = await callMcpToolWithResilience('registry', 'checkJurisdiction', { plotId, location });
        return res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
    }

    static async checkDuplicateFiling(citizenId: string, plotId: string) {
        const res = await callMcpToolWithResilience('registry', 'checkDuplicateFiling', { citizenId, plotId });
        return res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
    }

    static async checkCompleteness(caseData: any) {
        const res = await callMcpToolWithResilience('registry', 'checkCompleteness', { caseData });
        return res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
    }
}

// 4. Legal Research Service (with Caching)
export class LegalResearchService {
    static async searchPrecedents(query: string) {
        const cacheKey = `precedent:${query.toLowerCase().trim()}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                service: 'research',
                tool: 'searchPrecedents',
                status: 'CACHE_HIT',
                query
            }));
            return cached;
        }

        const res = await callMcpToolWithResilience('research', 'searchPrecedents', { query });
        const data = res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
        cache.set(cacheKey, data, 15 * 60 * 1000); // 15 mins cache TTL
        return data;
    }

    static async getStatute(actName: string, sectionId: string) {
        const cacheKey = `statute:${actName.toLowerCase()}:${sectionId}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                service: 'research',
                tool: 'getStatute',
                status: 'CACHE_HIT',
                actName,
                sectionId
            }));
            return cached;
        }

        const res = await callMcpToolWithResilience('research', 'getStatute', { actName, sectionId });
        const data = res.content?.[0] ? JSON.parse(res.content[0].text || '{}') : {};
        cache.set(cacheKey, data, 15 * 60 * 1000); // 15 mins cache TTL
        return data;
    }
}
