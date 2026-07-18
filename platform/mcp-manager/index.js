import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class MCPManager {
    static instance;
    connections = new Map();
    constructor() { }
    static getInstance() {
        if (!MCPManager.instance) {
            MCPManager.instance = new MCPManager();
        }
        return MCPManager.instance;
    }
    async initializeAll() {
        const servers = [
            { name: 'identity', relPath: '../../mcp/identity-server/src/index.js' },
            { name: 'document', relPath: '../../mcp/document-server/src/index.js' },
            { name: 'registry', relPath: '../../mcp/registry-server/src/index.js' },
            { name: 'research', relPath: '../../mcp/research-server/src/index.js' }
        ];
        for (const s of servers) {
            console.log(`Starting ${s.name} MCP Server...`);
            const serverPath = path.resolve(__dirname, s.relPath);
            const transport = new StdioClientTransport({
                command: 'node',
                args: [serverPath],
                env: { ...process.env, NODE_ENV: 'development' }
            });
            const client = new Client({
                name: `nyayaos-${s.name}-client`,
                version: '1.0.0'
            }, {
                capabilities: {}
            });
            await client.connect(transport);
            this.connections.set(s.name, {
                client,
                transport
            });
            console.log(`[MCPManager] Connected to ${s.name} MCP Server.`);
        }
    }
    async verifyHealthAll() {
        console.log('\n--- 🏥 MCP SERVERS HEALTH VERIFICATION ---');
        for (const [name, conn] of this.connections.entries()) {
            try {
                const response = await conn.client.callTool({
                    name: 'health'
                });
                const anyResponse = response;
                const responseText = JSON.stringify(anyResponse.content?.[0] || '');
                const isHealthy = responseText.toLowerCase().includes('healthy') || responseText.toLowerCase().includes('status');
                if (isHealthy && !anyResponse.isError) {
                    console.log(`✓ ${name.toUpperCase()} MCP Server: Healthy`);
                }
                else {
                    console.log(`- ${name.toUpperCase()} MCP Server: Unknown response template ${JSON.stringify(response)}`);
                }
            }
            catch (e) {
                console.log(`✗ ${name.toUpperCase()} MCP Server: Connection error: ${e.message || e}`);
            }
        }
        console.log('-------------------------------------------\n');
    }
    async getHealthStatus() {
        const statusDetails = {};
        const servers = ['identity', 'document', 'registry', 'research'];
        for (const name of servers) {
            const conn = this.connections.get(name);
            if (!conn) {
                statusDetails[name] = 'DOWN';
                continue;
            }
            try {
                const response = await conn.client.callTool({
                    name: 'health'
                });
                const anyResponse = response;
                const responseText = JSON.stringify(anyResponse.content?.[0] || '');
                const isHealthy = responseText.toLowerCase().includes('healthy') || responseText.toLowerCase().includes('status');
                if (isHealthy && !anyResponse.isError) {
                    statusDetails[name] = 'OK';
                }
                else {
                    statusDetails[name] = 'UNKNOWN';
                }
            }
            catch (e) {
                statusDetails[name] = 'ERROR';
            }
        }
        return statusDetails;
    }
    getClient(service) {
        const conn = this.connections.get(service);
        if (!conn) {
            throw new Error(`[MCPManager] No active connection for service: ${service}`);
        }
        return conn.client;
    }
    async shutdownAll() {
        console.log('Stopping all MCP servers...');
        for (const [name, conn] of this.connections.entries()) {
            try {
                await conn.client.close();
            }
            catch (e) {
                // ignore
            }
        }
        this.connections.clear();
        console.log('All MCP servers stopped.');
    }
}
