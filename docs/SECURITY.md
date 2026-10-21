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

The app is pinned to the original existing contract and Studionet chain 61999. Both write methods use the SDK with `leaderOnly:false` and zero value. No deployment action exists in the frontend. Each write displays a confirmation with destination, signer, method, and exact arguments before signing. EIP-1193 wallets must expose the same connected address and chain before submission; signature rejection, RPC errors, execution failure, and consensus failure are surfaced.

An optional browser-generated demo signer is offered for independent reproduction without an extension. Its key is generated with the SDK's secure key generator and stored in sessionStorage only in the app origin/tab. It is never imported from Studio, embedded in source, sent to a server, or exported. It is development-only; sessionStorage is readable by same-origin JavaScript and is not hardware-wallet security. Never send real assets to it. Only this demo signer can invoke the app's development faucet control.

Public pending transaction metadata is stored in localStorage before/after submission. A known hash is retained after polling/read errors and can be resumed without re-signing. Concurrent submissions are blocked. A submission error with no confirmed hash is treated as ambiguous unless it is a definite signature rejection; the user must inspect account history before explicitly clearing it. This cannot guarantee exactly-once delivery through an arbitrary wallet/RPC failure, but does not silently retry writes.

Record IDs are decoded from the finalized transaction's successful GenVM return, not guessed from a global counter. The app then reads the record at `LATEST_FINAL` and verifies its ID and submitter/reviewer attribution. Finalization without successful execution is never presented as a successful result. Consensus may require leader rotations or terminate without a record.

The app renders untrusted fields through textContent and exports JSON using Blob downloads. No cached fixture decision substitutes for a live read. The website is public: do not submit confidential material. Authenticate the DAO approval separately before relying on a decision.
