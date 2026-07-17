# ADR 0003: Agent Orchestration Design

## Status
Accepted

## Context
We need to coordinate multiple actions (Identity, Documents, Registry) without hardcoding sequential business steps directly into agents.

## Decision
We use a centralized Workflow Engine as the kernel. Agents are decoupled plugins loaded dynamically by a central registry.

## Consequence
- Case workflows are represented as declarative recipes.
- Individual agents have single points of responsibility.
- Zero direct coupling between agents.
