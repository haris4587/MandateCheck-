# Validation record

Validated locally on 2026-10-19:

- 40 offline Python contract/receipt tests: pass.
- Six frontend/SDK tests: pass.
- GenVM AST lint: pass (3 checks).
- Exact pinned SDK validation: pass (MandateCheck, 3 view methods, 2 write methods).
- Static frontend bundle: built successfully.
- Live source retrieved from Studionet: byte-for-byte equal to repository contract.

Offline tests execute the actual contract's parsing, encoding, hard checks, record writes, and validator comparison; only the GenVM host, storage containers, and model outputs are mocked. They cover successful and blocked reviews, hidden ERC-20 recipient changes, approve selectors, trailing calldata, wrong chain/treasury, reordered/missing/split actions, integer overflow, JSON duplicate keys, malformed model output, exact citations, independent disagreement, immutable records, and recovery after malicious submissions. Receipt tests detect changes to proposals, bundles, bindings, decisions, and networks.

Frontend tests cover explicit final-state reads, Studio request arguments, exact string amounts, transaction hash validation, and requiring execution success in addition to finalization.

The live network evidence is separate in `live-evidence.json`. The deployment used Normal (Full Consensus), not Leader Only. All demonstrated transfers are review data only; no DAO funds are moved.

Browser preview QA was unavailable because control-browser was not installed in the managed runtime. No claim is made that the frontend received full interactive browser coverage. Native Sites deployment results verify publication.

## Finalized live outcomes

| Review | Scenario | Result |
| --- | --- | --- |
| 1 | Fourth, unrelated recipient | BLOCKED |
| 2 | Three exact maintenance grants after the blocked review | MATCH |
| 3 | Same transfer bytes, changed purpose to marketing | MISMATCH |

All five transactions (deployment, proposal, and three reviews) finalized successfully. Review 3 required leader rotations before agreement; the contract retained strict category-by-category agreement rather than weakening validation. All three exported receipt hashes were independently recomputed successfully.
