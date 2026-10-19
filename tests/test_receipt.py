import copy
import importlib.util
import unittest
from pathlib import Path
spec=importlib.util.spec_from_file_location('receipt',Path(__file__).parents[1]/'scripts/verify_receipt.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class ReceiptTests(unittest.TestCase):
    def fixture(self):
        p={'id':'1','proposal_text':'Approve a grant','policy':{'actions':[]}}
        p['proposal_hash']=m.digest(p['proposal_text']);p['policy_hash']=m.digest(p['policy']);p['commitment_hash']=m.digest(p)
        r={'proposal_id':'1','proposal_commitment':p['commitment_hash'],'bundle':{'transactions':[]}}
        r['bundle_hash']=m.digest(r['bundle']);r['decision_hash']=m.digest(r)
        return {'network':'studionet','chainId':61999,'stateVariant':'LATEST_FINAL','proposal':p,'review':r}
    def test_receipt_verification(self):self.assertTrue(m.verify(self.fixture()))
    def test_tampering_fails(self):
        for section,field in [('proposal','proposal_text'),('review','bundle'),('review','proposal_id'),('review','decision_hash')]:
            r=self.fixture();r[section][field]='tampered'
            with self.subTest(section=section,field=field),self.assertRaises(AssertionError):m.verify(r)
        r=self.fixture();r['chainId']=1
        with self.assertRaises(AssertionError):m.verify(r)
