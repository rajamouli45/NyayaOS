var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { ToolDecorator as Tool, Widget, z } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';
let CalculatorTools = (() => {
    let _instanceExtraInitializers = [];
    let _calculate_decorators;
    let _convertTemperature_decorators;
    return class CalculatorTools {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _calculate_decorators = [Tool({
                    name: 'calculate',
                    description: 'Perform basic arithmetic calculations',
                    inputSchema: z.object({
                        operation: z.enum(['add', 'subtract', 'multiply', 'divide']).describe('The operation to perform'),
                        a: z.number().describe('First number'),
                        b: z.number().describe('Second number')
                    }),
                    examples: {
                        request: {
                            operation: 'add',
                            a: 5,
                            b: 3
                        },
                        response: {
                            operation: 'add',
                            a: 5,
                            b: 3,
                            result: 8,
                            expression: '5 + 3 = 8'
                        }
                    }
                }), Widget('calculator-result')];
            _convertTemperature_decorators = [Tool({
                    name: 'convert_temperature',
                    description: 'Convert temperature units based on file content or direct input. Supports Celsius (C) and Fahrenheit (F).',
                    inputSchema: z.object({
                        file_name: z.string().describe('Name of the uploaded file'),
                        file_type: z.string().describe('MIME type of the uploaded file'),
                        file_content: z.string().describe('Base64 encoded file content. Will be injected by system.'),
                        value: z.number().optional().describe('Temperature value to convert'),
                        from_unit: z.enum(['C', 'F']).optional().describe('Unit to convert from (C or F)'),
                        to_unit: z.enum(['C', 'F']).optional().describe('Unit to convert to (C or F)')
                    })
                })];
            __esDecorate(this, null, _calculate_decorators, { kind: "method", name: "calculate", static: false, private: false, access: { has: obj => "calculate" in obj, get: obj => obj.calculate }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _convertTemperature_decorators, { kind: "method", name: "convertTemperature", static: false, private: false, access: { has: obj => "convertTemperature" in obj, get: obj => obj.convertTemperature }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        async calculate(input, ctx) {
            ctx.logger.info('Performing calculation', {
                operation: input.operation,
                a: input.a,
                b: input.b
            });
            let result;
            let symbol;
            switch (input.operation) {
                case 'add':
                    result = input.a + input.b;
                    symbol = '+';
                    break;
                case 'subtract':
                    result = input.a - input.b;
                    symbol = '-';
                    break;
                case 'multiply':
                    result = input.a * input.b;
                    symbol = '×';
                    break;
                case 'divide':
                    if (input.b === 0) {
                        throw new Error('Cannot divide by zero');
                    }
                    result = input.a / input.b;
                    symbol = '÷';
                    break;
                default:
                    throw new Error('Invalid operation');
            }
            return {
                operation: input.operation,
                a: input.a,
                b: input.b,
                result,
                expression: `${input.a} ${symbol} ${input.b} = ${result}`
            };
        }
        async convertTemperature(input, ctx) {
            ctx.logger.info('Processing temperature file', {
                name: input.file_name,
                type: input.file_type,
                value: input.value,
                from: input.from_unit,
                to: input.to_unit
            });
            // Save file to uploads directory
            const uploadsDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const filePath = path.join(uploadsDir, input.file_name);
            // Decode base64
            if (input.file_content) {
                try {
                    const matches = input.file_content.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                    let buffer;
                    if (matches && matches.length === 3) {
                        buffer = Buffer.from(matches[2], 'base64');
                    }
                    else {
                        buffer = Buffer.from(input.file_content, 'base64');
                    }
                    fs.writeFileSync(filePath, buffer);
                    ctx.logger.info(`Saved file to ${filePath}`);
                }
                catch (e) {
                    ctx.logger.error('Failed to save file', { error: e instanceof Error ? e.message : String(e) });
                }
            }
            const fileStats = {
                name: input.file_name,
                type: input.file_type,
                saved_path: filePath,
                status: 'saved'
            };
            let result = null;
            let message = `Successfully processed and saved file ${input.file_name}`;
            // Perform conversion logic
            if (input.value !== undefined && input.from_unit && input.to_unit) {
                try {
                    message += `. Converting ${input.value}°${input.from_unit} to ${input.to_unit}`;
                    if (input.from_unit === input.to_unit) {
                        result = input.value;
                    }
                    else if (input.from_unit === 'C' && input.to_unit === 'F') {
                        result = (input.value * 9 / 5) + 32;
                    }
                    else if (input.from_unit === 'F' && input.to_unit === 'C') {
                        result = (input.value - 32) * 5 / 9;
                    }
                    else {
                        throw new Error('Unsupported unit conversion');
                    }
                    // Round to 2 decimal places
                    if (result !== null) {
                        result = Math.round(result * 100) / 100;
                        message += `. Result: ${result}°${input.to_unit}`;
                    }
                }
                catch (e) {
                    message += `. Conversion failed: ${e.message}`;
                }
            }
            else {
                message += `. No valid conversion parameters detected from manual input or file extraction.`;
            }
            return {
                status: 'success',
                message,
                file_info: fileStats,
                conversion_result: result !== null ? { value: result, unit: input.to_unit } : null,
                original_value: input.value !== undefined ? { value: input.value, unit: input.from_unit } : null
            };
        }
        constructor() {
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
})();
export { CalculatorTools };
