import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { SharedMemory } from './shared-memory/index.js';
import { EventBus } from './event-bus/index.js';
import { ExplainabilityAuditor } from './explainability/index.js';
import { AgentRegistry } from './agent-registry/index.js';
import { WorkflowEngine } from './workflow-engine/index.js';
import { WorkflowLoader } from './workflow-engine/loader.js';
// Import our mock agents
import { IdentityAgent, DocumentAgent, RegistryAgent, ResearchAgent } from '../agents/plugins/index.js';
import { MCPManager } from './mcp-manager/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function main() {
    console.log('\n==================================================');
    console.log('⚖️  NYAYAOS KERNEL MVP BOOTING...');
    console.log('==================================================');
    // 0. Initialize and Health Check Real MCP Servers
    const mcpManager = MCPManager.getInstance();
    try {
        await mcpManager.initializeAll();
        await mcpManager.verifyHealthAll();
    }
    catch (err) {
        console.error('🚨 Failed to boot MCP servers:', err.message || err);
        await mcpManager.shutdownAll();
        process.exit(1);
    }
    // 1. Instantiate Kernel Components
    const registry = new AgentRegistry();
    const eventBus = new EventBus();
    const auditor = new ExplainabilityAuditor();
    const memory = new SharedMemory();
    const loader = new WorkflowLoader();
    const engine = new WorkflowEngine(registry, eventBus, auditor);
    // 2. Register Mock Agents
    registry.register(new IdentityAgent());
    registry.register(new DocumentAgent());
    registry.register(new RegistryAgent());
    registry.register(new ResearchAgent());
    console.log('🔄 All agents loaded successfully into Registry.');
    // 3. Register Event Listeners for Live Timeline observability
    eventBus.subscribe('WorkflowStarted', (event) => {
        console.log(`📡 [EventBus] 🟢 WorkflowStarted: ${event.workflowId} (Total Steps: ${event.payload.stepsCount})`);
    });
    eventBus.subscribe('AgentStarted', (event) => {
        console.log(`📡 [EventBus] ⚡ AgentStarted: ${event.payload.agentName} (Step: ${event.payload.stepId})`);
    });
    eventBus.subscribe('AgentCompleted', (event) => {
        console.log(`📡 [EventBus] ✅ AgentCompleted: ${event.payload.agentName} (Step: ${event.payload.stepId})`);
    });
    eventBus.subscribe('WorkflowCompleted', (event) => {
        console.log(`📡 [EventBus] 🏁 WorkflowCompleted: ${event.workflowId} in ${event.payload.totalDurationMs}ms`);
    });
    eventBus.subscribe('WorkflowFailed', (event) => {
        console.log(`📡 [EventBus] 🚨 WorkflowFailed: ${event.payload.stepId} Reason: "${event.payload.error}"`);
    });
    // 4. Load & Execute property-dispute workflow
    try {
        const yamlPath = path.join(__dirname, '../workflows/property-dispute.yaml');
        console.log(`📁 Loading workflow recipe definition from: property-dispute.yaml`);
        const workflow = loader.load(yamlPath);
        await engine.run(workflow, memory);
        // 5. Print Observability Explainability Log
        auditor.printTimeline();
    }
    catch (err) {
        console.error('🚨 Critical Runtime Error inside Engine Execution Flow:', err.message || err);
        process.exitCode = 1;
    }
    finally {
        await mcpManager.shutdownAll();
    }
}
main().catch((err) => {
    console.error('Failed to run main process:', err);
    process.exit(1);
});
