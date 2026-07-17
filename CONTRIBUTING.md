# Contributing Guidelines

Welcome to NyayaOS! To keep our codebase clean and organized, please follow these guidelines.

## Code & Architectural Conventions

1. **Platform vs Product Separation**: 
   - Core orchestration, routing, event systems, and memory belong to `platform/`.
   - Client interfaces and customer-specific integrations belong to `apps/`.
2. **Extensible Agents**:
   - Every agent is structured as a plugin inside `agents/plugins/`.
   - Agents should not call each other directly. All inter-agent coordination is orchestrated by the `Platform Workflow Engine`.
3. **MCP Boundaries**:
   - Agents access external tools and data sources *only* through NitroStack MCP servers.
   - Database operations should remain decoupled.
4. **NitroStack Server Conventions**:
   - Internal MCP servers should strict-follow `@nitrostack/core` patterns (standard decorators, Zod input verification, context loggers).

## Development Flow

- Use `pnpm` (configured fallback `npm`) workspace commands:
  - `pnpm dev` - run development workflow
  - `pnpm build` - compile TS workspace
  - `pnpm lint` - check style issues
  - `pnpm format` - format styles via Prettier

## Commit Message Format

We follow conventional commits format:
- `chore: ...` (non-feature work, setting up build pipes, etc)
- `docs: ...` (documentation changes)
- `build: ...` (webpack, tsconfig, pnpm updates)
- `feat: ...` (new feature implementations)
- `fix: ...` (bug fixes)
