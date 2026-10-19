# MandateCheck

**Governance execution review: from an approved proposal to an exact transaction bundle.**

[Public app](https://mandatecheck.itzanza2.chatgpt.site) · [Contract source](contracts/mandate_check.py) · [Security model](docs/SECURITY.md) · [Live evidence](docs/live-evidence.json)

A DAO intends to fund three maintenance teams. Its proposed execution adds a fourth recipient. MandateCheck blocks the extra action using deterministic constraints; independent GenLayer validators assess intent when those constraints pass.

## The product

1. Commit the proposal text, approval reference, and ordered transfer policy.
2. Prepare a proposed execution bundle against that immutable proposal ID.
3. Sign `commit_proposal` or `review_bundle` in GenLayer Studio using its built-in account.
4. Read the finalized record in the public app, inspect evidence, and export the receipt.

The frontend calls real GenLayer view methods with `LATEST_FINAL`. Its request builder supplies exact method names and argument values with individual copy controls. Signing occurs in Studio, not through an external wallet or a key imported into the website. This is an explicit Studio signing workflow, not a claim of a cross-origin Studio wallet connection.

**Approval is self-attested.** The submitter address is recorded, but a proposal reference does not prove a real DAO vote passed. The supplied immutable text is the review baseline. MandateCheck neither executes transfers nor verifies external DAO authority, treasury control, token code, or the eventual executed transaction. A MATCH is a review result for these exact committed inputs.

## Two layers of review

| Layer | Checks |
| --- | --- |
| Deterministic | Chain ID, treasury, ordered action count, destination, native value, complete calldata bytes, and permitted operation |
| Semantic consensus | Policy alignment with the proposal, documented execution intent, and completeness of conditions/deliverables |

Only native transfers and standard `ERC20.transfer(address,uint256)` are supported. Both use operation `0` (call). ERC-20 target, zero native value, selector, recipient padding, amount, calldata length, and all remaining bytes must exactly match the contract-derived encoding. Approvals, arbitrary calls, extra bytes, delegate calls, reordered transfers, extra recipients, and split payments fail closed.

| Outcome | Meaning |
| --- | --- |
| `BLOCKED` | Deterministic violations; semantic assessment skipped |
| `MATCH` | All three independent semantic findings match and exact constraints pass |
| `MISMATCH` | One or more semantic findings conflict with the mandate |
| `INCONCLUSIVE` | Missing material information, unavailable model, or invalid evidence/model response |

Validators independently run the assessment, validate source excerpts, and compare all three decision-critical findings and the derived outcome. Reasons may differ. A category disagreement cannot be hidden by the same aggregate outcome. Actual consensus failure produces no record; it is not converted into a successful decision.

## Contract API

- `commit_proposal(title, approval_reference, proposal_text, policy_json) -> proposal_id`
- `review_bundle(proposal_id, bundle_json) -> review_id`
- `get_proposal(proposal_id) -> JSON string`
- `get_review(review_id) -> JSON string`
- `list_records(kind, offset, limit) -> paginated JSON`, where kind is `proposals` or `reviews`

Each new review is independent. A blocked, inconclusive, or malicious submission cannot occupy a proposal's only candidate slot. There are no edit/delete/replace methods. No global record cap can be exhausted by one user. Transaction/network fees and network capacity remain external availability constraints.

## Input formats

See [examples.js](examples.js), which supplies the frontend examples and their exact base-unit amount strings. `chain_id` describes the execution's target chain (e.g. Ethereum `1`), not the review network (Studionet `61999`). Treasury is a committed claimed execution context, not proof that a bundle will originate from that address.

Policy:

```json
{"chain_id":1,"treasury":"0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","actions":[{"kind":"NATIVE_TRANSFER","recipient":"0x1111111111111111111111111111111111111111","asset":"0x0000000000000000000000000000000000000000","amount":"1000000000000000000","purpose":"Fund maintenance team 1"}]}
```

Bundle:

```json
{"chain_id":1,"treasury":"0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","transactions":[{"to":"0x1111111111111111111111111111111111111111","value":"1000000000000000000","data":"0x","operation":0,"purpose":"Fund maintenance team 1"}]}
```

Use 1–12 policy actions and 1–16 bundle transactions. Amounts are canonical decimal **strings** up to uint256, never floating point. Unknown and duplicate JSON fields are rejected; addresses/hex are normalized to lowercase. Native asset is the zero address; recipients, treasuries, and ERC-20 targets cannot be zero.

## Reproduce

Requirements: Node 22+, Python 3.12+.

```sh
npm ci
npm test
npm run build
python -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/genvm-lint check contracts/mandate_check.py
.venv/bin/genvm-lint schema contracts/mandate_check.py --output docs/abi.json
node scripts/read-evidence.mjs
python scripts/verify_receipt.py path/to/exported-receipt.json
```

`npm test` runs 40 Python contract/receipt tests and six SDK/frontend tests. Offline tests mock the GenVM host, storage, and model responses while executing the real contract source; they are not real multi-validator executions. The separate live evidence captures real Full Consensus Studio transactions and finalized reads. See [deployment instructions](docs/DEPLOYMENT.md).

The app is a static ES module bundle built with esbuild and pinned `genlayer-js` 1.1.8. It contains no private keys, database, server signing service, or browser-generated wallet. The contract pins the SDK runner in its source header. The static host serves `dist/`; the tracked Sites manifest identifies the public project.

## Official documentation checked

- [Equivalence principle and independent verification](https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle)
- [Finalized contract reads](https://docs.genlayer.com/developers/decentralized-applications/reading-data)
- [Write lifecycle and execution-result checks](https://docs.genlayer.com/developers/decentralized-applications/writing-data)
- [Studio and networks](https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio)
- [GenVM linter and SDK validation](https://docs.genlayer.com/api-references/genlayer-linter)

MIT licensed. This is a development-network governance review tool, not a treasury execution module or production security audit.
