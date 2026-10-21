# Deployment and live reproduction

Network: **Studionet, chain ID 61999**

Contract: `0x5D97353a41392f45475025EF29C388f7Dfdd2afb`

[Studio](https://studio.genlayer.com/run-debug) · [Contract explorer](https://explorer-studio.genlayer.com/address/0x5D97353a41392f45475025EF29C388f7Dfdd2afb) · [Public application](https://mandatecheck.itzanza2.chatgpt.site)

Deployment transaction: `0x8e5e7f3ed8c64d661de3833ac851409f544bdec7fbb2a5a03cc7d95ed227f431`

The contract was imported from the exact repository source and deployed using Studio's built-in account in **Normal (Full Consensus)** mode. No MetaMask connection or external wallet was used. `scripts/read-evidence.mjs` compares `getContractCode` byte-for-byte with the repository source before collecting finalized evidence. `deployment.json` records the SHA-256, network, and address.

## Repeat the demo against the existing instance

Open the public website and follow [STEWARD-RESPONSE.md](STEWARD-RESPONSE.md). The primary path now signs both methods directly in the app; no generic Studio redirect or redeployment is needed. The original Studio deployment and evidence remain valid. The new optional demo signer is distinct from the Studio account used for that original deployment.

For a new deployment, update `deployment.json` with your address, run `npm run build`, and publish the output. Do not claim the existing evidence applies to changed code. Studionet is a hosted development environment; availability and state retention are not production guarantees.

## Evidence and testing

`docs/live-evidence.json` contains the public submitter, transaction hashes, execution results, validator votes, proposal data, and finalized review reports. It is collected from the network and contains no account secrets. Offline tests are separate and explicitly mock the host. CI runs those tests, static build, and GenVM check.

The original release did not include interactive frontend write coverage. The correction adds direct writes and a separate live published-frontend demonstration in FRONTEND-DEMO.md.
