# ADR 002: Event-Driven Workflow Architecture

## Status
Accepted

## Context
Executing procedural code for multi-step agent chains in blocking API threads is prone to failure and leaves no audit trail.

## Decision
We implement a decoupled EventBus interface. The Judicial Kernel orchestrates workflow execution through the Workflow Execution Engine, which broadcasts lifecycle execution milestones (`WorkflowStarted`, `AgentStarted`, `AgentCompleted`, `WorkflowCompleted`, `WorkflowFailed`) as structured events.

## Consequences
Allows real-time logging, asynchronous SSE status updates to the client portal UI, and isolated auditing logs.
