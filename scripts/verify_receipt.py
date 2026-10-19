"""Verify exported MandateCheck receipt hashes. Does not independently prove network inclusion."""
import hashlib
import json
import sys

def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=True).encode()).hexdigest()

def verify(receipt):
    assert receipt['chainId']==61999 and receipt['network']=='studionet', 'Wrong review network'
    assert receipt['stateVariant']=='LATEST_FINAL', 'Nonfinal receipt'
    p=dict(receipt['proposal']);r=dict(receipt['review'])
    assert p['proposal_hash']==digest(p['proposal_text']), 'Proposal text changed'
    assert p['policy_hash']==digest(p['policy']), 'Policy changed'
    ph=p.pop('commitment_hash');assert ph==digest(p), 'Proposal commitment mismatch'
    assert r['proposal_id']==p['id'] and r['proposal_commitment']==ph, 'Wrong proposal binding'
    assert r['bundle_hash']==digest(r['bundle']), 'Bundle changed'
    dh=r.pop('decision_hash');assert dh==digest(r), 'Decision changed'
    return True

if __name__=='__main__':
    with open(sys.argv[1]) as f:verify(json.load(f))
    print('All receipt hashes verified. Compare chain/contract and records against finalized network state to verify inclusion.')
