// Read-only verification of the records produced by the published frontend.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {createReader,DEPLOYED_ADDRESS,completed} from '../chain.js';
const client=createClient({chain:studionet}),reader=createReader(client);
const receipt=JSON.parse(await fs.readFile('docs/frontend-demo-receipt.json','utf8'));
const proposal=await reader.read(DEPLOYED_ADDRESS,'get_proposal',['2']);
const review=await reader.read(DEPLOYED_ADDRESS,'get_review',['4']);
assert.deepEqual(proposal,receipt.proposal);assert.deepEqual(review,receipt.review);
assert.equal(receipt.contract,DEPLOYED_ADDRESS);assert.equal(review.proposal_id,'2');assert.equal(review.report.outcome,'MATCH');
const source=await client.getContractCode(DEPLOYED_ADDRESS);
assert.equal(source,await fs.readFile('contracts/mandate_check.py','utf8'));
const transactions=[];
for(const [method,hash,id] of [
 ['commit_proposal','0x20a6b50012ab354e5c0b90fe8b57e969d60fe70c43c5461d6c3dae332fa65c14','2'],
 ['review_bundle','0xaa2673ce72fcf879d5fe7de4a93bfdad2ba3721de5431515b38a9a730a50dcb6','4']]){
 const tx=await reader.transaction(hash);assert.equal(completed(tx),true);assert.equal(tx.recordId,id);
 assert.equal(tx.raw.to_address.toLowerCase(),DEPLOYED_ADDRESS.toLowerCase());
 assert.equal(tx.raw.from_address.toLowerCase(),proposal.submitter.toLowerCase());
 assert.equal(tx.raw.execution_mode,'NORMAL');assert.equal(tx.raw.leader_only,false);
 transactions.push({method,hash,status:tx.status,execution:tx.execution,returnedRecordId:id,sender:tx.raw.from_address,contract:tx.raw.to_address,executionMode:tx.raw.execution_mode,leaderOnly:tx.raw.leader_only});
}
const evidence={capturedAt:new Date().toISOString(),publishedFrontend:'https://mandatecheck.itzanza2.chatgpt.site/',network:'studionet',chainId:61999,contract:DEPLOYED_ADDRESS,sourceMatchesRepository:true,sourceSha256:createHash('sha256').update(source).digest('hex'),frontendExportMatchesFinalizedState:true,proposal,review,transactions};
await fs.writeFile('docs/frontend-demo-evidence.json',JSON.stringify(evidence,null,2)+'\n');
console.log('Verified both browser-submitted transactions: FINALIZED, successful return IDs 2 and 4, Full Consensus, original contract; exported frontend receipt exactly equals live finalized state.');
process.exit(0);
