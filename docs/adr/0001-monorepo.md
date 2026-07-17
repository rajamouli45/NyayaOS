# ADR 0001: Monorepo Architecture

## Status
Accepted

## Context
We are building a multi-module workspace containing apps (Citizen Portal, Judge portal), custom agent libraries, and multiple NitroStack Model Context Protocol (MCP) servers.

## Decision
We choose a monorepo setup using `pnpm` (fallback npm) workspaces and Turborepo.

## Consequence
- Code sharing across packages is solved natively.
- Turbo cache will optimize incremental local compilations.
