import {createClient} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
export function createReader(client=createClient({chain:studionet})){
 return {async read(address,functionName,args=[]){return JSON.parse(await client.readContract({address,functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL}));},
 async transaction(hash){if(!/^0x[0-9a-fA-F]{64}$/.test(hash))throw Error('Enter a 32-byte transaction hash.');const tx=await client.getTransaction({hash});return {status:tx.statusName||tx.status,execution:executionName(tx),raw:tx};}};
}
export function studioRequest(address,functionName,args){if(!/^0x[0-9a-fA-F]{40}$/.test(address))throw Error('Contract deployment is not configured.');return {network:'studionet',chainId:61999,contract:address,functionName,args,value:'0',signing:'Use your GenLayer Studio built-in account. This request does not execute treasury transfers.'};}
export function completed(tx){return tx.status==='FINALIZED'&&tx.execution==='FINISHED_WITH_RETURN';}

export function executionName(tx){
 if(tx.txExecutionResultName)return tx.txExecutionResultName;
 const receipts=tx.consensus_data?.leader_receipt;
 const latest=Array.isArray(receipts)?receipts.at(-1):receipts;
 if(latest?.execution_result==='SUCCESS'&&latest.result?.status==='return')return 'FINISHED_WITH_RETURN';
 return latest?.execution_result==='SUCCESS'?'RETURN_NOT_VERIFIED':latest?.execution_result||'NOT_AVAILABLE';
}
