// relayer/verify_and_mark.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const snarkjs = require('snarkjs');
const { Gateway, Wallets } = require('fabric-network');

async function verifyProofLocal(proofFile, publicFile, vkeyFile) {
  const proof = JSON.parse(fs.readFileSync(proofFile));
  const publicSignals = JSON.parse(fs.readFileSync(publicFile));
  const vKey = JSON.parse(fs.readFileSync(vkeyFile));
  const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
  console.log('snark verify result:', res);
  return { ok: res, publicSignals };
}

async function submitMarkVerified(firId) {
  const ccpPath = path.resolve(process.env.CONNECTION_PROFILE);
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  const walletPath = path.resolve(process.env.WALLET_PATH);
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const identityLabel = process.env.RELAYER_ID;
  const identity = await wallet.get(identityLabel);
  if (!identity) {
    throw new Error(`Identity ${identityLabel} not found in wallet at ${walletPath}`);
  }

  const gateway = new Gateway();
  await gateway.connect(ccp, { wallet, identity: identityLabel, discovery: { enabled: true, asLocalhost: true } });

  const network = await gateway.getNetwork(process.env.CHANNEL_NAME || 'mychannel');
  const contract = network.getContract(process.env.CHAINCODE_NAME || 'fircc');

  console.log('Submitting markVerified for', firId);
  const tx = await contract.submitTransaction('markVerified', firId);
  console.log('Transaction has been submitted. Result:', tx.toString());
  await gateway.disconnect();
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const proofFile = path.resolve(process.env.PROOF_FILE || `${root}/../circuit/build/proof.json`);
  const publicFile = path.resolve(process.env.PUBLIC_FILE || `${root}/../circuit/build/public.json`);
  const vkeyFile = path.resolve(process.env.VKEY_FILE || `${root}/../circuit/build/verification_key.json`);
  const firId = process.env.FIR_ID || 'FIR001';

  console.log('Verifying proof files:', proofFile, publicFile, vkeyFile);
  const { ok, publicSignals } = await verifyProofLocal(proofFile, publicFile, vkeyFile);
  if (!ok) {
    console.error('Proof invalid. Aborting.');
    process.exit(1);
  }

  console.log('Proof valid. Public signals:', publicSignals);
  await submitMarkVerified(firId);
  console.log('Done.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
