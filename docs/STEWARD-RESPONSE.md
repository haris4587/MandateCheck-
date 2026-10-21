# Reviewer execution path — frontend correction

The steward correctly identified that the first frontend only prepared arguments and redirected to a generic Studio workspace. That was not an independently reproducible execution path. This update replaces it with actual in-app signing and writes to the **same deployed contract**:

`0x5D97353a41392f45475025EF29C388f7Dfdd2afb` on **Studionet 61999**.

There is no need to deploy, import source, attach a Studio workspace, or select an instance. The application fixes the destination in its write helper and shows it in the account panel and every confirmation.

## Exact independent reproduction

1. Visit https://mandatecheck.itzanza2.chatgpt.site/#workbench.
2. Click **Use Studionet demo account**, then **Get demo funds**. This creates a disposable browser-local signer with the official SDK. It is separate from Studio's account and needs no extension. Alternatively choose **Connect browser wallet** and approve the Studionet switch in an installed EIP-1193 wallet.
3. In **Commit proposal**, click **Load example**. Optionally give the title a unique suffix so your record is easy to recognize.
4. Click **Commit proposal on Studionet**. The confirmation shows `commit_proposal`, the fixed deployed address, account, zero value, and all four arguments. Choose **Sign and submit**; browser-wallet users also approve their wallet's signature request.
5. The transaction panel displays the real transaction hash and consensus status. Wait for **FINALIZED** and a successful return. The app extracts the **Proposal ID** from this transaction's return, reads that exact finalized record, and fills the review form with its ID and a matching bundle.
6. Click **Submit bundle for review**, inspect the `review_bundle` confirmation, then **Sign and submit**. Wait for finalization. The returned **Review ID** opens automatically with the live result and evidence. A valid matching example should produce MATCH; model/network uncertainty may instead produce INCONCLUSIVE or an explicit failed/undetermined transaction.
7. For a deterministic adversarial check, choose **Extra recipient** against the same proposal and submit. Its finalized record should show BLOCKED with `ACTION_COUNT_MISMATCH` and `UNAPPROVED_ACTION:3`.
8. Export the receipt. Copy/share the `?review=<your ID>#workbench` URL, or enter that ID in **Read the result**. The public records list also retrieves the new records from `LATEST_FINAL`.

## Recovery and verification

- A hash is preserved before polling. Use **Resume tracking** after a reload, network error, or five-minute timeout; do not submit a duplicate.
- The proposal/review ID comes from the finalized GenVM return, not a guess based on total counts. The app validates the live record's signer attribution.
- A rejected wallet signature, wrong chain/account, execution failure, or undetermined consensus is not reported as a successful write.
- If submission fails without a hash, check the signing account's explorer history before clearing the unconfirmed request. The app does not automatically resubmit.
- The contract source and address are unchanged; only the application workflow and its evidence/docs are updated.

## Evidence

See [FRONTEND-DEMO.md](FRONTEND-DEMO.md) for the short end-to-end demonstration of the published frontend and resulting live records. Offline tests additionally cover exact destination/method/zero-value binding, returned IDs, signature rejection, wrong network/account, duplicate prevention, failed execution, read failure, and resuming the original hash.
