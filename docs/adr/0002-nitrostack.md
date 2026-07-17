# ADR 0002: Framework Choice for MCP Servers

## Status
Accepted

## Context
We require robust Model Context Protocol (MCP) servers for exposing domain specific actions (identity verification, doc analysis, court records registration) to LLM agents.

## Decision
We select `NitroStack` as our primary MCP framework.

## Consequence
- Clean TypeScript class structures and decorators.
- Rapid bootstrapping of input schema validation (via Zod).
- Easily previewable React UI components using NitroStudio.
