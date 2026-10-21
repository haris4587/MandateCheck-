# Submission update after steward request

## Reply / changes summary

The generic Studio handoff has been replaced with direct in-app `commit_proposal` and `review_bundle` writes to the original deployed Studionet contract. Reviewers can use a connected browser wallet or an independent disposable demo account without deploying anything. Each call shows its fixed destination and exact arguments before signing. The app displays the transaction hash, consensus/finalization status, returned Proposal/Review ID, and live finalized result. Pending hashes survive reload and resume without repeating the write; signature rejection and execution/network errors are surfaced.

The published-frontend demonstration created Proposal #2 and Review #4 (MATCH), including a pending-page reload/resume and receipt export. Both transactions finalized successfully in Full Consensus against the original instance. The downloaded receipt exactly matches the live finalized records and all hashes verify. The contract source/address remain unchanged. 61 local tests and GenVM validation pass. Browser-wallet provider behavior is regression-tested; the recorded live run uses the demo account.

## Suggested updated how-to

1. Open the public workbench. Choose **Use Studionet demo account**, then **Get demo funds**, or connect an installed browser wallet on Studionet 61999.
2. In **Commit proposal**, select **Load example**, click **Commit proposal on Studionet**, check the confirmation and choose **Sign and submit**. Wait for FINALIZED; note the returned Proposal ID.
3. The app fills the review form with that proposal and its matching bundle. Click **Submit bundle for review**, confirm, and wait for FINALIZED. The returned Review ID opens the live findings automatically.
4. Export the receipt or copy the review link. After a reload/timeout, choose **Resume tracking** to follow the same transaction. No Studio workspace or new deployment is needed.

## Expected verification outcome (under 500 characters)

Both methods execute from the app against the existing Studionet deployment. Each successful transaction displays its hash and returned record ID, then reads the finalized record. The demonstrated path creates Proposal #2 and Review #4 with MATCH. Review #4 opens by direct link, appears in the live records list, and exports a hash-verifiable receipt. The 38-second walkthrough shows the published frontend and these results.

## Evidence to add

- Updated website: https://mandatecheck.itzanza2.chatgpt.site/
- Live result: https://mandatecheck.itzanza2.chatgpt.site/?review=4#workbench
- Short demonstration: https://mandatecheck.itzanza2.chatgpt.site/frontend-demo.mp4
- Exact reviewer instructions: https://github.com/haris4587/MandateCheck-/blob/main/docs/STEWARD-RESPONSE.md
- Demonstration and screenshots: https://github.com/haris4587/MandateCheck-/blob/main/docs/FRONTEND-DEMO.md
- Machine-readable execution evidence: https://github.com/haris4587/MandateCheck-/blob/main/docs/frontend-demo-evidence.json
- Actual frontend-exported receipt: https://github.com/haris4587/MandateCheck-/blob/main/docs/frontend-demo-receipt.json

No reply or Portal submission has been sent automatically.
