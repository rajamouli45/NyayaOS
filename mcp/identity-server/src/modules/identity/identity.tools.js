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
export class IdentityTools {
    async health(input, ctx) {
        return {
            success: true,
            confidence: 1.0,
            data: { status: 'healthy' },
            reasoning: 'Identity MCP Server is online and responsive',
            executionTimeMs: 1
        };
    }
    async verifyIdentity(input, ctx) {
        const start = Date.now();
        ctx.logger.info(`verifyIdentity called for ID ${input.citizenId}`);
        const verified = input.citizenId === 'cit-9988';
        return {
            success: verified,
            confidence: 0.99,
            data: verified ? {
                verified: true,
                name: 'Rajesh Kumar',
                address: '123, Park Street, Bengaluru'
            } : {
                verified: false
            },
            reasoning: verified ? 'Successfully verified citizen identity and extracted profile token hash.' : 'Citizen ID not found in registry database.',
            executionTimeMs: Date.now() - start
        };
    }
    async validateCitizen(input, ctx) {
        const start = Date.now();
        ctx.logger.info(`validateCitizen called for ID ${input.citizenId}`);
        const matched = input.citizenId === 'cit-9988' && input.address.toLowerCase().includes('bengaluru');
        return {
            success: matched,
            confidence: 0.98,
            data: { matched },
            reasoning: matched ? 'Citizen address validation matches record registry Karnataka.' : 'Address does not match record.',
            executionTimeMs: Date.now() - start
        };
    }
    async extractProfile(input, ctx) {
        const start = Date.now();
        ctx.logger.info(`extractProfile called for ID ${input.citizenId}`);
        const success = input.citizenId === 'cit-9988';
        return {
            success,
            confidence: 0.99,
            data: success ? {
                name: 'Rajesh Kumar',
                age: 42,
                gender: 'M',
                address: '123, Park Street, Bengaluru'
            } : {},
            reasoning: success ? 'Extracted registry demographics profile details.' : 'Demographics extraction failed - ID not found.',
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
], IdentityTools.prototype, "health", null);
__decorate([
    Tool({
        name: 'verifyIdentity',
        description: 'Verify citizen identity details by ID',
        inputSchema: z.object({
            citizenId: z.string().describe('ID of the citizen to verify')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IdentityTools.prototype, "verifyIdentity", null);
__decorate([
    Tool({
        name: 'validateCitizen',
        description: 'Validate custom citizen record match details',
        inputSchema: z.object({
            citizenId: z.string().describe('ID of citizen'),
            address: z.string().describe('Address value to validate')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IdentityTools.prototype, "validateCitizen", null);
__decorate([
    Tool({
        name: 'extractProfile',
        description: 'Extract demographics of a verified citizen',
        inputSchema: z.object({
            citizenId: z.string().describe('ID of citizen')
        })
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IdentityTools.prototype, "extractProfile", null);
