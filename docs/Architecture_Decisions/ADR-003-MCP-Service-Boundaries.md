# ADR 003: Model Context Protocol (MCP) Service Boundaries

## Status
Accepted

## Context
Bundling domain verification logic (e.g. biometric matching, PDF parsing, registry checks, legal search) inside a single server creates monolith dependencies that are difficult to swap.

## Decision
We decouple agent logic into separate MCP Stdio servers using the NitroStack framework:
1. **Identity MCP**: biometric and name database match.
2. **Document MCP**: deed validation and parsed signatures.
3. **Registry MCP**: territorial court boundary checking.
4. **Legal Research MCP**: statute and precedent parsing.

## Consequences
Features logical decoupling where services can be scaled or replaced individually.
