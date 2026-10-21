import {createReader,createWriter,demoSigner,connectBrowserWallet,fundDemo,completed,DEPLOYED_ADDRESS} from './chain.js';
import {source,policy,example} from './examples.js';
const $=id=>document.getElementById(id), reader=createReader();
let deployment,signer,lastWrite,lastReceipt,page=0,totals={proposals:0,reviews:0};
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function message(s=''){$('message').textContent=s;}
function tab(name){for(const button of document.querySelectorAll('[data-tab]'))button.classList.toggle('active',button.dataset.tab===name);for(const key of ['proposal','review','result'])$(key+'-panel').classList.toggle('hidden',key!==name);message();}
for(const button of document.querySelectorAll('[data-tab]'))button.onclick=()=>tab(button.dataset.tab);
function loadProposal(){$('title').value='Maintenance grants — three teams';$('reference').value='Illustrative DAO vote #42 (self-attested)';$('proposal-text').value=source;$('policy').value=JSON.stringify(policy,null,2);}
$('example-proposal').onclick=loadProposal;
$('load-demo').onclick=()=>{tab('proposal');loadProposal();$('workbench').scrollIntoView({behavior:'smooth'});};
$('bundle-example').onchange=()=>{if($('bundle-example').value)$('bundle').value=JSON.stringify(example($('bundle-example').value),null,2);};
async function busy(button,fn){button.disabled=true;message();try{await fn();}catch(e){message(e.message||String(e));}finally{button.disabled=false;}}
function id(value){if(!/^[1-9][0-9]{0,76}$/.test(value))throw Error('Enter a positive record ID.');return value;}
function json(value){JSON.parse(value);return value;}
const writer=createWriter({storage:localStorage,reader,onUpdate:renderProgress});
function errorText(e){return e?.code===4001?'Wallet request rejected.':e?.message||String(e);}
function renderProgress(p){
 lastWrite=p;localStorage.setItem('mandatecheck-last-write',JSON.stringify(p));
 $('transaction-panel').classList.remove('hidden');$('write-status').textContent=p.status;
 $('write-method').textContent='Method: '+(p.method||'—')+' · Existing contract: '+DEPLOYED_ADDRESS;
 $('write-sender').textContent='Signing account: '+(p.sender||'—');
 $('write-hash').textContent='Transaction hash: '+(p.hash||'not returned yet');
 $('write-explorer').hidden=!p.hash;if(p.hash)$('write-explorer').href='https://explorer-studio.genlayer.com/tx/'+p.hash;
 $('write-progress').textContent=p.status==='FINALIZED'&&p.recordId?'Finalized with a successful return; live record verified.':p.status==='SUBMISSION_UNCERTAIN'?'No hash confirmed. Inspect this account in the explorer before retrying.':p.status==='AWAITING_SIGNATURE'?'Awaiting signature and submission.':p.status+' · '+(p.execution||'Waiting for network consensus and finalization.');
 $('returned-id').textContent=p.recordId?((p.method==='commit_proposal'?'Proposal':'Review')+' ID: '+p.recordId):'';
 $('open-write-result').classList.toggle('hidden',!p.recordId);
 $('resume-write').hidden=!!p.recordId||!writer.pending()?.hash;
 $('clear-uncertain').classList.toggle('hidden',p.status!=='SUBMISSION_UNCERTAIN');
}
function signerStatus(){ $('signer-status').textContent=signer?(signer.mode==='demo'?'Demo account: ':'Browser wallet: ')+signer.address+' · Studionet 61999':'No signing account selected.';$('fund-demo').disabled=signer?.mode!=='demo';}
$('demo-account').onclick=()=>busy($('demo-account'),()=>{signer=demoSigner(sessionStorage);signerStatus();});
$('fund-demo').onclick=()=>busy($('fund-demo'),async()=>{await fundDemo(signer);message('Demo funds requested for '+signer.address+'. You can now submit to the existing contract.');});
$('connect-wallet').onclick=()=>busy($('connect-wallet'),async()=>{signer=await connectBrowserWallet(window.ethereum);signerStatus();});
function bundleFor(p){return {chain_id:p.policy.chain_id,treasury:p.policy.treasury,transactions:p.policy.actions.map(a=>({to:a.kind==='NATIVE_TRANSFER'?a.recipient:a.asset,value:a.kind==='NATIVE_TRANSFER'?a.amount:'0',data:a.kind==='NATIVE_TRANSFER'?'0x':'0xa9059cbb'+a.recipient.slice(2).padStart(64,'0')+BigInt(a.amount).toString(16).padStart(64,'0'),operation:0,purpose:a.purpose}))};}
async function showWriteResult(result){
 if(result.method==='commit_proposal'){
  const p=result.record||await reader.read(DEPLOYED_ADDRESS,'get_proposal',[result.id]);
  tab('review');$('proposal-id').value=p.id;$('bundle').value=JSON.stringify(bundleFor(p),null,2);
  message('Proposal #'+p.id+' finalized and read from the existing deployment. Submit a bundle below.');$('review-panel').scrollIntoView({behavior:'smooth',block:'start'});
 }else{tab('result');$('review-id').value=result.id;await readReview(result.id);history.replaceState(null,'','?review='+result.id+'#workbench');$('result-panel').scrollIntoView({behavior:'smooth',block:'start'});}
 await refresh();
}
async function submit(method,args){
 if(!signer)throw Error('Choose a Studionet demo account or connect a browser wallet first.');
 if(deployment.address!==DEPLOYED_ADDRESS)throw Error('Deployment configuration does not match the reviewed contract.');
 if(writer.pending())throw Error('A previous request is unresolved. Resume tracking it below.');
 $('confirm-summary').textContent=method+' · Signer: '+signer.address;
 $('confirm-args').textContent=JSON.stringify(args,null,2);
 const confirmed=new Promise(resolve=>$('confirm-write').addEventListener('close',()=>resolve($('confirm-write').returnValue==='submit'),{once:true}));
 $('confirm-write').returnValue='cancel';$('confirm-write').showModal();if(!await confirmed)return;
 try{const result=await writer.submit(signer,method,args);await showWriteResult(result);}
 catch(e){message(errorText(e));throw e;}
}
$('prepare-proposal').onclick=()=>busy($('prepare-proposal'),()=>{const title=$('title').value.trim(),ref=$('reference').value.trim(),text=$('proposal-text').value;if(title.length<3||ref.length<5||text.trim().length<40)throw Error('Add a title, approval reference, and at least 40 characters of proposal text.');return submit('commit_proposal',[title,ref,text,json($('policy').value)]);});
$('prepare-review').onclick=()=>busy($('prepare-review'),()=>submit('review_bundle',[id($('proposal-id').value.trim()),json($('bundle').value)]));
$('resume-write').onclick=()=>busy($('resume-write'),async()=>showWriteResult(await writer.track()));
$('open-write-result').onclick=()=>busy($('open-write-result'),()=>showWriteResult({method:lastWrite.method,id:lastWrite.recordId}));
$('clear-uncertain').onclick=()=>busy($('clear-uncertain'),()=>{writer.clearUncertain();$('clear-uncertain').classList.add('hidden');message('Unconfirmed request cleared. Verify account history before any new submission.');});
async function readReview(rid){id(rid);message('Reading finalized network state…');const r=await reader.read(deployment.address,'get_review',[rid]);const p=await reader.read(deployment.address,'get_proposal',[r.proposal_id]);lastReceipt={network:deployment.network,chainId:deployment.chainId,contract:deployment.address,stateVariant:'LATEST_FINAL',review:r,proposal:p};renderReceipt(r,p);message();}
function renderReceipt(r,p){$('result').className='result-content';$('result').replaceChildren();const header=node('div',undefined,'result-title');header.append(node('h3','Review #'+r.id),node('span',r.report.outcome,'badge '+r.report.outcome));$('result').append(header,node('p','Proposal #'+p.id+' · '+p.title),node('p','Approval: '+p.approval_status+' · Submitter '+p.submitter));
 if(r.deterministic_errors.length){$('result').append(node('p','Exact transaction constraints failed. Semantic review was skipped.'));const ul=node('ul',undefined,'error-list');for(const e of r.deterministic_errors)ul.append(node('li',e));$('result').append(ul);}else{for(const c of r.report.checks){const section=node('div',undefined,'result-check'),h=node('h4',c.category.replaceAll('_',' '));h.append(node('span',c.finding,'badge '+(c.finding==='UNCLEAR'?'INCONCLUSIVE':c.finding)));section.append(h,node('p',c.reason));if(c.quote)section.append(node('blockquote',c.quote));section.append(node('small','Citation source: '+c.source));$('result').append(section);}}
 for(const [label,hash] of [['Proposal commitment',r.proposal_commitment],['Bundle SHA-256',r.bundle_hash],['Decision SHA-256',r.decision_hash]])$('result').append(node('div',label+': '+hash,'hash-detail'));
 const exp=node('button','Export review receipt ↓','small-button');exp.onclick=()=>download('mandatecheck-review-'+r.id+'.json',JSON.stringify(lastReceipt,null,2));$('result').append(exp);const share=node('button','Copy review link','small-button');share.onclick=()=>busy(share,async()=>{await navigator.clipboard.writeText(location.origin+'/?review='+r.id+'#workbench');share.textContent='Link copied ✓';});$('result').append(share);
 const inspect=node('details');inspect.append(node('summary','Inspect complete committed inputs'),node('pre',JSON.stringify(lastReceipt,null,2)));$('result').append(inspect);
}
function download(filename,text){const u=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=node('a');a.href=u;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
$('read-review').onclick=()=>busy($('read-review'),()=>readReview($('review-id').value.trim()));
$('track-tx').onclick=()=>busy($('track-tx'),async()=>{const hash=$('tx-hash').value.trim();localStorage.setItem('mandatecheck-tracked-tx',hash);const tx=await reader.transaction(hash);$('tx-state').textContent=String(tx.status)+' / '+String(tx.execution||'execution not available')+(completed(tx)?' — finalized successfully. Returned record ID: '+(tx.recordId||'inspect receipt'): ' — not confirmed successful. Keep tracking this hash; do not duplicate the write.');});
async function refresh(){if(!deployment?.address)throw Error('Contract deployment is not configured yet.');const lists=await Promise.all(['proposals','reviews'].map(kind=>reader.read(deployment.address,'list_records',[kind,page*20,20])));lists.forEach((list,i)=>{const kind=i===0?'proposals':'reviews';totals[kind]=list.total;const target=$(kind+'-list');target.replaceChildren();if(!list.records.length)target.append(node('p','No finalized '+kind+' on this page.'));for(const item of list.records){const row=node('div',undefined,'record-row'),open=node('button',kind==='proposals'?'#'+item.id+' · '+item.title:'Review #'+item.id+' · Proposal #'+item.proposal_id);open.onclick=()=>busy(open,async()=>{if(kind==='reviews'){tab('result');$('review-id').value=item.id;await readReview(item.id);}else{const p=await reader.read(deployment.address,'get_proposal',[item.id]);tab('review');$('proposal-id').value=item.id;$('bundle').value=JSON.stringify(bundleFor(p),null,2);} $('workbench').scrollIntoView({behavior:'smooth'});});row.append(open);if(item.outcome)row.append(node('span',item.outcome,'badge '+item.outcome));target.append(row);}});$('page').textContent='Page '+(page+1);$('prev').disabled=page===0;$('next').disabled=(page+1)*20>=Math.max(totals.proposals,totals.reviews);}
$('refresh').onclick=()=>busy($('refresh'),refresh);$('prev').onclick=()=>busy($('prev'),async()=>{page=Math.max(0,page-1);await refresh();});$('next').onclick=()=>busy($('next'),async()=>{page++;await refresh();});
async function init(){try{deployment=await fetch('./deployment.json').then(r=>{if(!r.ok)throw Error('Deployment metadata unavailable');return r.json();});if(deployment.address!==DEPLOYED_ADDRESS)throw Error('Unexpected deployment address. Writes disabled.');const restored=writer.pending()||JSON.parse(localStorage.getItem('mandatecheck-last-write')||'null');if(restored){if(restored.status==='AWAITING_SIGNATURE')restored.status='SUBMISSION_UNCERTAIN';renderProgress(restored);}$('contract-address').textContent=deployment.address||'Awaiting deployment';$('contract-link').href=deployment.explorerUrl||deployment.studioUrl;$('tx-hash').value=localStorage.getItem('mandatecheck-tracked-tx')||'';await refresh();const rid=new URLSearchParams(location.search).get('review');if(rid){tab('result');$('review-id').value=id(rid);await readReview(rid);}}catch(e){$('proposals-list').textContent='Network read unavailable. Use Refresh to retry.';$('reviews-list').textContent='No cached result is being shown.';message(e.message);}}
init();
