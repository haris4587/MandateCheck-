# Security model

## Trust boundaries

A proposal's text, approval reference, transfer policy, and bundles are user-controlled. The signer is recorded by GenVM and cannot select a different submitter address in the arguments. An approval reference, treasury address, team name, purpose, and proposal title remain **self-attested claims**. No external vote, onchain governor, organization identity, token implementation, or treasury ownership is authenticated. Names and arbitrary URLs never grant authority.

The complete proposal and policy are stored immutably at commitment time. Validators read the stored snapshot, not a mutable webpage. The reference URL/identifier is provenance metadata and is not fetched. This removes post-commit URL mutation from the comparison but does not authenticate the original document. A user may choose a misleading baseline; an external verifier must authenticate that baseline against the DAO's actual approval before using a decision.

## Hard constraints

Before any LLM call, compare the execution context, count, order, destination, value, data, and operation against canonical encodings derived from the policy. No model can override a failed check. Native transfers require empty data. ERC-20 transfers require the standard selector, exact recipient/amount encoding, and zero native value. Policy amounts must be positive uint256 strings. Bundle zero values are permitted for ERC-20 calls, and mismatching native values are blocked.

The contract supports an explicit small transfer subset; unsupported operations require a new version, not prompt-based permission. A contract recipient can have fallback behavior and an ERC-20 may be nonstandard, malicious, fee-on-transfer, upgraded, or reentrant. Checking call bytes does not simulate target-chain effects or prove actual receipt of tokens. Treasury and target chain are comparison fields, not enforced execution origin or replay protection on an external chain.

## Semantic consensus

Leader and validators independently call the model over the same committed inputs. Strict parsing enforces three ordered checks, bounded reasons, known findings, and exact source citations. Findings and derived outcome must agree for every category. Validators never accept a mere schema or trust the leader's judgment. Explanations may differ; they are evidence notes, not separately agreed verbatim facts.

A malformed response, fabricated citation, or unavailable model returns UNCLEAR for all checks within that node. Only equivalent independently produced assessments can reach consensus. If the network cannot agree, the transaction fails/gets undetermined and no record is added. INCONCLUSIVE is not permission to execute.

The prompt marks all submitted content as untrusted data and forbids following embedded instructions. Deterministic checks are outside the model. This reduces prompt-injection impact but is not proof that arbitrary adversarial language cannot influence several models. Independent models and source-citation validation do not eliminate shared model errors.

## Storage and recovery

Each proposal and review has an independent monotonically assigned ID. No update/delete methods, overwrite slots, or global application count cap exist. Bad reviews cannot replace an earlier decision or lock later reviews. IDs and counts are u256. Input and pagination bounds control per-call cost; network fees/quotas remain network concerns. The frontend does not automatically retry writes.

SHA-256 hashes bind proposal text, canonical policy, normalized bundle, and complete review record. The proposal commitment includes its ID and submitter; the decision includes reviewer, proposal commitment, review ID, bundle, errors, and report. These hashes are application receipts; they do not constitute digital signatures or prove consensus in isolation. A portable receipt must be compared to finalized network state at the correct chain and deployed contract.

## Frontend

The app reads `LATEST_FINAL`, uses textContent for all untrusted display, and exports JSON through Blob downloads. It does not import private keys or access an EIP-1193 wallet. The user signs in Studio using its built-in account. A prepared JSON request is not itself a signed transaction. Copy failures and network errors are shown; cached fixture decisions are never substituted for live reads. A successful transaction requires FINALIZED and FINISHED_WITH_RETURN, not finalization alone.

The website is public. Do not submit confidential governance material. Read the proposal submitter and approval status, inspect the full transfer inputs, confirm the exact chain/contract, and authenticate the DAO approval independently before relying on a review.
