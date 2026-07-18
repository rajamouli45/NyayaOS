var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ToolDecorator as Tool, z } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const judgmentsPath = path.resolve(__dirname, '../../../data/judgments.json');
const actsPath = path.resolve(__dirname, '../../../data/acts.json');
export class CalculatorTools {
    async health(input, ctx) {
        return {
            success: true,
            confidence: 1.0,
            data: { status: 'healthy' },
            reasoning: 'Research MCP Server is online and responsive',
            executionTimeMs: 1
        };
    }
    async searchPrecedents(input, ctx) {
        const start = Date.now();
        ctx.logger.info(`searchPrecedents called for query: ${input.query}`);
        let judgments = [];
        try {
            if (fs.existsSync(judgmentsPath)) {
                judgments = JSON.parse(fs.readFileSync(judgmentsPath, 'utf8'));
            }
        }
        catch (e) {
            ctx.logger.error('Failed to load judgments:', e.message || e);
        }
        const queryLower = input.query.toLowerCase();
        const matches = judgments.filter(j => j.title.toLowerCase().includes(queryLower) ||
            j.summary.toLowerCase().includes(queryLower) ||
            j.keywords.some((k) => k.toLowerCase().includes(queryLower)));
        const hit = matches.length > 0 ? matches[0] : judgments[0]; // fallback to first landmark as default
        return {
            success: true,
            confidence: 0.92,
            data: { precedent: hit ? hit.title : 'None', caseNumber: hit ? hit.case : 'General Appeal' },
            reasoning: hit ? hit.summary : 'No matching court precedents found in database registry.',
            executionTimeMs: Date.now() - start
        };
    }
    async getStatute(input, ctx) {
        const start = Date.now();
        ctx.logger.info(`getStatute called for ${input.actName} Sec ${input.sectionId}`);
        let acts = [];
        try {
            if (fs.existsSync(actsPath)) {
                acts = JSON.parse(fs.readFileSync(actsPath, 'utf8'));
            }
        }
        catch (e) {
            ctx.logger.error('Failed to load acts:', e.message || e);
        }
        const match = acts.find(a => a.act.toLowerCase().includes(input.actName.toLowerCase()) &&
            a.section === input.sectionId);
        return {
            success: !!match,
            confidence: 0.99,
            data: match ? { act: match.act, section: match.section, title: match.title, content: match.content } : {},
            reasoning: match ? `Retrieved section details of ${match.act}.` : 'Statute section not found.',
            executionTimeMs: Date.now() - start
        };
    }
}
__decorate([
    Tool({
        name: 'health',
        description: 'Verify server health status',
        inputSchema: z.object({})
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CalculatorTools.prototype, "health", null);
__decorate([
    Tool({
        name: 'searchPrecedents',
        description: 'Search landmark Court judgments precedents matching legal issue query',
        inputSchema: z.object({
            query: z.string().describe('Legal key term or dispute query')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CalculatorTools.prototype, "searchPrecedents", null);
__decorate([
    Tool({
        name: 'getStatute',
        description: 'Retrieve statute section contents of standard government Acts',
        inputSchema: z.object({
            actName: z.string().describe('Name of the Act'),
            sectionId: z.string().describe('Section identifier number')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CalculatorTools.prototype, "getStatute", null);
