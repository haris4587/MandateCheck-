# Validation record

Original contract validated on 2026-10-19; direct-write frontend correction tested on 2026-10-21:

- 40 offline Python contract/receipt tests: pass.
- 21 frontend/SDK tests: pass.
- GenVM AST lint: pass (3 checks).
- Exact pinned SDK validation: pass (MandateCheck, 3 view methods, 2 write methods).
- Static frontend bundle: built successfully.
- Live source retrieved from Studionet: byte-for-byte equal to repository contract.

Offline tests execute the actual contract's parsing, encoding, hard checks, record writes, and validator comparison; only the GenVM host, storage containers, and model outputs are mocked. They cover successful and blocked reviews, hidden ERC-20 recipient changes, approve selectors, trailing calldata, wrong chain/treasury, reordered/missing/split actions, integer overflow, JSON duplicate keys, malformed model output, exact citations, independent disagreement, immutable records, and recovery after malicious submissions. Receipt tests detect changes to proposals, bundles, bindings, decisions, and networks.

Frontend tests cover direct writes to the fixed existing deployment, full consensus and zero value, both public methods, wrong chain/account, signature rejection, exact return-ID extraction, concurrent clicks, execution failure, attribution binding, ambiguous submission errors, polling/read recovery, tab-local test signer, and finalized-state reads.

The live network evidence is separate in `live-evidence.json`. The deployment used Normal (Full Consensus), not Leader Only. All demonstrated transfers are review data only; no DAO funds are moved.

The original release lacked interactive frontend write coverage. The correction is tested through the published public frontend with a disposable development-network signer; see FRONTEND-DEMO.md. The optional extension-wallet path has provider-level regression tests; it is not claimed to have received a live MetaMask approval test.

## Finalized live outcomes

| Review | Scenario | Result |
| --- | --- | --- |
| 1 | Fourth, unrelated recipient | BLOCKED |
| 2 | Three exact maintenance grants after the blocked review | MATCH |
| 3 | Same transfer bytes, changed purpose to marketing | MISMATCH |

All five transactions (deployment, proposal, and three reviews) finalized successfully. Review 3 required leader rotations before agreement; the contract retained strict category-by-category agreement rather than weakening validation. All three exported receipt hashes were independently recomputed successfully.

## Published-frontend correction (2026-10-21)

The real public app created Proposal #2 and Review #4 (MATCH) using a session-local SDK signer. The review page was reloaded during consensus; Resume tracking followed the original hash without signing again. The exported frontend receipt was hash-verified and compared exactly with live finalized state. Both transactions were verified as Full Consensus, successful finalized returns against the original deployed address. See frontend-demo-evidence.json and FRONTEND-DEMO.md. The separate browser-wallet route is provider-regression-tested, not claimed as a live extension approval test.
