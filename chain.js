import {createClient,createAccount,generatePrivateKey} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {TransactionHashVariant} from 'genlayer-js/types';
export const DEPLOYED_ADDRESS='0x5D97353a41392f45475025EF29C388f7Dfdd2afb';
export const CHAIN_ID=61999;
export function executionName(tx){
 if(tx.txExecutionResultName)return tx.txExecutionResultName;
 const receipts=tx.consensus_data?.leader_receipt;
 const latest=Array.isArray(receipts)?receipts.at(-1):receipts;
 if(latest?.execution_result==='SUCCESS'&&latest.result?.status==='return')return 'FINISHED_WITH_RETURN';
 return latest?.execution_result==='SUCCESS'?'RETURN_NOT_VERIFIED':latest?.execution_result||'NOT_AVAILABLE';
}
export function recordId(tx){
 const receipts=tx.consensus_data?.leader_receipt;
 const latest=Array.isArray(receipts)?receipts.at(-1):receipts;
 if(latest?.result?.status!=='return')return null;
 try {const value=JSON.parse(latest.result.payload?.readable);return typeof value==='string'&&/^[1-9][0-9]*$/.test(value)?value:null;}catch{return null;}
}
export function completed(tx){return tx.status==='FINALIZED'&&tx.execution==='FINISHED_WITH_RETURN';}
export function createReader(client=createClient({chain:studionet})){
 return {async read(address,functionName,args=[]){return JSON.parse(await client.readContract({address,functionName,args,transactionHashVariant:TransactionHashVariant.LATEST_FINAL}));},
 async transaction(hash){if(!/^0x[0-9a-fA-F]{64}$/.test(hash))throw Error('Enter a 32-byte transaction hash.');const tx=await client.getTransaction({hash});if(!tx)throw Error('Transaction not found yet. Retry this hash.');return {status:tx.statusName||tx.status,execution:executionName(tx),recordId:recordId(tx),raw:tx};}};
}
export async function connectBrowserWallet(provider){
 if(!provider?.request)throw Error('No browser wallet detected. Use the Studionet demo account instead.');
 const accounts=await provider.request({method:'eth_requestAccounts'});
 if(!/^0x[0-9a-fA-F]{40}$/.test(accounts?.[0]||''))throw Error('Wallet returned no account.');
 if(BigInt(await provider.request({method:'eth_chainId'}))!==BigInt(CHAIN_ID)){
  try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xf22f'}]});}
  catch(e){if(e.code!==4902)throw e;await provider.request({method:'wallet_addEthereumChain',params:[{chainId:'0xf22f',chainName:'GenLayer Studionet',rpcUrls:['https://studio.genlayer.com/api'],nativeCurrency:{name:'GEN',symbol:'GEN',decimals:18},blockExplorerUrls:['https://explorer-studio.genlayer.com']}]});await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xf22f'}]});}
 }
 if(BigInt(await provider.request({method:'eth_chainId'}))!==BigInt(CHAIN_ID))throw Error('Switch wallet to Studionet (61999).');
 return {address:accounts[0],mode:'wallet',client:createClient({chain:studionet,account:accounts[0],provider}),provider};
}
export function demoSigner(storage){
 const name='mandatecheck-studionet-demo-key';let key=storage.getItem(name);
 if(!key){key=generatePrivateKey();storage.setItem(name,key);}
 const account=createAccount(key);return {address:account.address,mode:'demo',client:createClient({chain:studionet,account})};
}
export async function fundDemo(signer){
 if(signer.mode!=='demo')throw Error('Demo faucet is available only for the test account.');
 if(Number(await signer.client.getChainId())!==CHAIN_ID)throw Error('Wrong network.');
 await signer.client.request({method:'sim_fundAccount',params:[signer.address,10e18]});
}
export function createWriter({storage,reader=createReader(),onUpdate=()=>{},delay=ms=>new Promise(r=>setTimeout(r,ms))}){
 const key='mandatecheck-pending-write-v2';let sending=false;
 const pending=()=>JSON.parse(storage.getItem(key)||'null');
 const save=p=>{storage.setItem(key,JSON.stringify(p));onUpdate(p);};
 async function track(){
  const p=pending();if(!p?.hash)throw Error('No submitted transaction hash to track.');
  for(let i=0;i<150;i++){
   const tx=await reader.transaction(p.hash);save({...p,status:tx.status,execution:tx.execution});
   if(['UNDETERMINED','CANCELED','CANCELLED','FAILED','LEADER_TIMEOUT','VALIDATORS_TIMEOUT'].includes(tx.status)){storage.removeItem(key);throw Error('Transaction ended '+tx.status+'. No successful result was confirmed.');}
   if(tx.status==='FINALIZED'){
    if(!completed(tx)){storage.removeItem(key);throw Error('Transaction finalized with execution failure: '+tx.execution+'. Inspect the transaction before retrying.');}
    if(!tx.recordId)throw Error('Transaction finalized, but return ID could not be decoded. Inspect its receipt; do not submit again.');
    const functionName=p.method==='commit_proposal'?'get_proposal':'get_review';
    const record=await reader.read(DEPLOYED_ADDRESS,functionName,[tx.recordId]);
    if(record.id!==tx.recordId||String(record.submitter||record.reviewer).toLowerCase()!==p.sender.toLowerCase())throw Error('Finalized record binding does not match the signed transaction.');
    save({...p,status:'FINALIZED',execution:tx.execution,recordId:tx.recordId});storage.removeItem(key);
    return {id:tx.recordId,method:p.method,record,hash:p.hash};
   }
   await delay(2000);
  }
  throw Error('Still pending after five minutes. Resume tracking this transaction; do not submit it again.');
 }
 return {pending,track,clearUncertain(){const p=pending();if(p?.hash)throw Error('A transaction hash exists. Resume tracking it.');storage.removeItem(key);},
 async submit(signer,method,args){
  if(sending||pending())throw Error('A previous request is unresolved. Resume tracking it before another write.');
  if(!signer)throw Error('Choose a demo account or connect a browser wallet first.');
  if(!['commit_proposal','review_bundle'].includes(method))throw Error('Unsupported contract method.');
  sending=true;
  try{
  if(Number(await signer.client.getChainId())!==CHAIN_ID)throw Error('Wrong network: use Studionet 61999.');
  if(signer.provider){const accounts=await signer.provider.request({method:'eth_accounts'});if(accounts?.[0]?.toLowerCase()!==signer.address.toLowerCase())throw Error('Wallet account changed. Connect it again.');if(BigInt(await signer.provider.request({method:'eth_chainId'}))!==BigInt(CHAIN_ID))throw Error('Wallet network changed. Connect to Studionet again.');}
  save({method,args,sender:signer.address,status:'AWAITING_SIGNATURE'});
  try{
   const hash=await signer.client.writeContract({address:DEPLOYED_ADDRESS,functionName:method,args,value:0n,leaderOnly:false});
   save({method,args,sender:signer.address,hash,status:'SUBMITTED'});
  }catch(e){
   if(e.code===4001||e.cause?.code===4001){storage.removeItem(key);onUpdate({status:'REJECTED'});throw Error('Wallet signature rejected. Nothing was submitted.');}
   save({...pending(),status:'SUBMISSION_UNCERTAIN'});throw Error('Submission was not confirmed: '+(e.message||String(e))+'. Inspect the account transaction history before clearing this request or retrying.');
  }
  return await track();
  }finally{sending=false;}
 }};
}
