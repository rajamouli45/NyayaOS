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
export class RegistryTools {
    async health(input, ctx) {
        return {
            success: true,
            confidence: 1.0,
            data: { status: 'healthy' },
            reasoning: 'Registry MCP Server is online and responsive',
            executionTimeMs: 1
        };
    }
    async checkJurisdiction(input, ctx) {
        const start = Date.now();
        ctx.logger.info(`checkJurisdiction called for plot ${input.plotId} at ${input.location}`);
        // Success if Bengaluru/Karnataka and plot matches plot-7412A
        const isKarnataka = input.location.toLowerCase().includes('karnataka') || input.location.toLowerCase().includes('bengaluru');
        const correctPlot = input.plotId === 'plot-7412A';
        const isJurisdiction = isKarnataka && correctPlot;
        return {
            success: isJurisdiction,
            confidence: 0.98,
            data: { isJurisdiction, courtNode: 'Land Tribunal Karnataka' },
            reasoning: isJurisdiction ? `Land records registry check completed. Plot ID ${input.plotId} confirmed matches dispute claims.` : 'Dispute location falls outside Karnataka registry jurisdiction.',
            executionTimeMs: Date.now() - start
        };
    }
    async checkDuplicateFiling(input, ctx) {
        const start = Date.now();
        ctx.logger.info(`checkDuplicateFiling called for ${input.citizenId}`);
        // No duplicate filing for Rajesh Kumar
        const isDuplicate = false;
        return {
            success: true,
            confidence: 0.99,
            data: { isDuplicate },
            reasoning: 'No active duplicate dispute cases registered in this municipal limit.',
            executionTimeMs: Date.now() - start
        };
    }
    async checkCompleteness(input, ctx) {
        const start = Date.now();
        ctx.logger.info('checkCompleteness called');
        const data = input.caseData || {};
        const identityVerified = !!data.identityVerified;
        const documentVerified = !!data.documentVerified;
        const complete = identityVerified && documentVerified;
        return {
            success: complete,
            confidence: 1.0,
            data: { complete },
            reasoning: complete ? 'Filing completeness verified. Case is complete.' : 'Missing verified identity or deed documents check parameters.',
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
], RegistryTools.prototype, "health", null);
__decorate([
    Tool({
        name: 'checkJurisdiction',
        description: 'Check if plot ID falls within correct court jurisdiction',
        inputSchema: z.object({
            plotId: z.string().describe('Plot ID to check'),
            location: z.string().describe('Location of the dispute')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegistryTools.prototype, "checkJurisdiction", null);
__decorate([
    Tool({
        name: 'checkDuplicateFiling',
        description: 'Verify citizen has not filed duplicates recently',
        inputSchema: z.object({
            citizenId: z.string().describe('Citizen ID'),
            plotId: z.string().describe('Plot ID')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegistryTools.prototype, "checkDuplicateFiling", null);
__decorate([
    Tool({
        name: 'checkCompleteness',
        description: 'Verify all required headers and parameters have been populated',
        inputSchema: z.object({
            caseData: z.any().describe('The collected case details object')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RegistryTools.prototype, "checkCompleteness", null);
