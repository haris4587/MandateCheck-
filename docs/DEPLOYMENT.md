# Deployment and live reproduction

Network: **Studionet, chain ID 61999**

Contract: `0x5D97353a41392f45475025EF29C388f7Dfdd2afb`

[Studio](https://studio.genlayer.com/run-debug) · [Contract explorer](https://explorer-studio.genlayer.com/address/0x5D97353a41392f45475025EF29C388f7Dfdd2afb) · [Public application](https://mandatecheck.itzanza2.chatgpt.site)

Deployment transaction: `0x8e5e7f3ed8c64d661de3833ac851409f544bdec7fbb2a5a03cc7d95ed227f431`

The contract was imported from the exact repository source and deployed using Studio's built-in account in **Normal (Full Consensus)** mode. No MetaMask connection or external wallet was used. `scripts/read-evidence.mjs` compares `getContractCode` byte-for-byte with the repository source before collecting finalized evidence. `deployment.json` records the SHA-256, network, and address.

## Repeat the demo

1. In the app, load the maintenance proposal example and prepare its Studio commitment.
2. Open Studio. Import `contracts/mandate_check.py` if deploying your own instance; choose Normal (Full Consensus), then Deploy. To inspect the published instance use its explorer link. The Studio workspace retains its deployed contract locally for the account used during this demo; the app cannot select a Studio workspace on someone else's browser automatically.
3. Expand `commit_proposal`. Paste title, approval reference, proposal text, and `policy_json` using the app's individual Copy value controls. Send with the Studio built-in account.
4. Wait for successful finalization. Use the returned proposal ID.
5. Expand `review_bundle`. Paste the proposal ID and the app's extra-recipient bundle. Finalized review returns BLOCKED.
6. Submit the matching bundle against the same proposal. It remains independently reviewable after the blocked submission.
7. Submit the changed-purpose example: identical destinations/amounts but marketing instead of maintenance. This requires semantic consensus and should return MISMATCH.
8. Read the review IDs in the public app. Export the JSON receipt and verify its hashes with `scripts/verify_receipt.py`.

For a new deployment, update `deployment.json` with your address, run `npm run build`, and publish the output. Do not claim the existing evidence applies to changed code. Studionet is a hosted development environment; availability and state retention are not production guarantees.

## Evidence and testing

`docs/live-evidence.json` contains the public submitter, transaction hashes, execution results, validator votes, proposal data, and finalized review reports. It is collected from the network and contains no account secrets. Offline tests are separate and explicitly mock the host. CI runs those tests, static build, and GenVM check.

Browser preview QA was unavailable in this managed environment because the required control-browser capability was not installed. Source/build/SDK checks and real Studio interaction are recorded separately; they are not claimed as a full browser regression test of the public frontend.
