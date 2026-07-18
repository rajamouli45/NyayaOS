import { Agent } from '../../packages/contracts/src/index.js';

export class AgentRegistry {
    private agents: Map<string, Agent> = new Map();

    register(agent: Agent): void {
        const key = agent.name.toLowerCase();
        if (this.agents.has(key)) {
            throw new Error(`Agent with name ${agent.name} is already registered.`);
        }
        this.agents.set(key, agent);
    }

    get(name: string): Agent {
        const key = name.toLowerCase();
        const agent = this.agents.get(key) || this.agents.get(`${key}agent`);
        if (!agent) {
            throw new Error(`Agent ${name} is not registered in the Registry.`);
        }
        return agent;
    }

    getAll(): Agent[] {
        return Array.from(this.agents.values());
    }
}
