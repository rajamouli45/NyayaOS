# ADR 001: Three-Layer Terminology Architecture

## Status
Accepted

## Context
In early developments, naming component labels across the frontend dashboard, backend contracts, and server modules was inconsistent, leading to confusion during evaluations.

## Decision
We establish a three-layer terminology abstraction mapping:
1. **Architecture**: Core coding constructs (e.g. `Judicial Kernel`, `Judicial Memory Bus`, `Explainability Engine`).
2. **System**: Services interface layer (e.g. `Workflow Planner`, `Event Store`, `Explainability Service`).
3. **User UI**: Client-facing text and labels (e.g. `Workflow Status`, `Live Logs / Events Feed`, `Explainability Summary`).

## Consequences
Reduces naming mismatches while maintaining precise coding layers.
