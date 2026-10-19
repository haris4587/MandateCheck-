# Suggested Project submission

Title: MandateCheck — Governance Execution Review

MandateCheck compares a committed DAO proposal with a proposed execution bundle. GenLayer validators independently assess policy alignment, execution intent, and completeness using immutable input snapshots and exact supporting excerpts. Deterministic rules enforce chain, treasury, action count/order, recipients, native values, ERC-20 selectors/calldata, and permitted operations; AI cannot override a failed check. Every review is append-only and bound to SHA-256 commitments. A bad submission cannot occupy a proposal's only review slot. The public app prepares Studio built-in-account calls, reads finalized state, tracks transaction execution, and exports verifiable receipts. Live Full Consensus examples demonstrate BLOCKED, MATCH, and MISMATCH. Approval is explicitly self-attested; the tool reviews inputs and does not execute treasury transfers. 46 local tests plus GenVM lint/SDK validation pass.

## Evidence links

- Website: https://mandatecheck.itzanza2.chatgpt.site
- Repository: https://github.com/haris4587/MandateCheck-
- Contract: https://github.com/haris4587/MandateCheck-/blob/main/contracts/mandate_check.py
- Live evidence: https://github.com/haris4587/MandateCheck-/blob/main/docs/live-evidence.json
- Security: https://github.com/haris4587/MandateCheck-/blob/main/docs/SECURITY.md
- Tests: https://github.com/haris4587/MandateCheck-/tree/main/tests
- Deployment: https://github.com/haris4587/MandateCheck-/blob/main/docs/DEPLOYMENT.md
- Contract explorer: https://explorer-studio.genlayer.com/address/0x5D97353a41392f45475025EF29C388f7Dfdd2afb

The project has not been submitted to the Portal automatically.
