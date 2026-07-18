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
import { PromptDecorator as Prompt } from '@nitrostack/core';
let CalculatorPrompts = (() => {
    let _instanceExtraInitializers = [];
    let _getHelp_decorators;
    return class CalculatorPrompts {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getHelp_decorators = [Prompt({
                    name: 'calculator_help',
                    description: 'Get help with calculator operations',
                    arguments: [
                        {
                            name: 'operation',
                            description: 'The operation to get help with (optional)',
                            required: false
                        }
                    ]
                })];
            __esDecorate(this, null, _getHelp_decorators, { kind: "method", name: "getHelp", static: false, private: false, access: { has: obj => "getHelp" in obj, get: obj => obj.getHelp }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        async getHelp(args, ctx) {
            ctx.logger.info('Generating calculator help prompt');
            const operation = args.operation;
            if (operation) {
                // Help for specific operation
                const helpText = this.getOperationHelp(operation);
                return [
                    {
                        role: 'user',
                        content: `How do I use the ${operation} operation in the calculator?`
                    },
                    {
                        role: 'assistant',
                        content: helpText
                    }
                ];
            }
            // General help
            return [
                {
                    role: 'user',
                    content: 'How do I use the calculator?'
                },
                {
                    role: 'assistant',
                    content: `The calculator supports four basic operations:

1. **Addition** - Add two numbers together
   Example: calculate(operation="add", a=5, b=3) = 8

2. **Subtraction** - Subtract one number from another
   Example: calculate(operation="subtract", a=10, b=4) = 6

3. **Multiplication** - Multiply two numbers
   Example: calculate(operation="multiply", a=6, b=7) = 42

4. **Division** - Divide one number by another
   Example: calculate(operation="divide", a=20, b=5) = 4

Just call the 'calculate' tool with the operation and two numbers!`
                }
            ];
        }
        getOperationHelp(operation) {
            const helps = {
                add: 'Use addition to sum two numbers. Call calculate(operation="add", a=5, b=3) to get 8.',
                subtract: 'Use subtraction to find the difference. Call calculate(operation="subtract", a=10, b=4) to get 6.',
                multiply: 'Use multiplication to find the product. Call calculate(operation="multiply", a=6, b=7) to get 42.',
                divide: 'Use division to find the quotient. Call calculate(operation="divide", a=20, b=5) to get 4. Note: Cannot divide by zero!'
            };
            return helps[operation] || 'Unknown operation. Available operations: add, subtract, multiply, divide.';
        }
        constructor() {
            __runInitializers(this, _instanceExtraInitializers);
        }
    };
})();
export { CalculatorPrompts };
