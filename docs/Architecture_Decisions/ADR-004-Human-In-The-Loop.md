# ADR 004: Human-in-the-Loop Judicial Oversight

## Status
Accepted

## Context
Fully automating judgments with LLMs poses safety, legal, and operational risks due to context constraints and algorithmic bias.

## Decision
NyayaOS is designed as an assistant platform. The Judicial Kernel verifies factual details (identity, document signatures, jurisdiction plot boundaries) and retrieves matching statutes/precedents. The final case verdict registry is published to the Judicial Memory Bus, leaving the ultimate verdict to the Judge Portal review action.

## Consequences
Guarantees human oversight and constitutional check safety bounds.
