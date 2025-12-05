/**
 * Usage:
 *  node scripts/registerFIROnChain.js --token <ADMIN_TOKEN> [--firId <FIR_ID>]
 *
 * If --firId is omitted the script will fetch the first FIR from /getAllFIRs
 * and attempt to register it on-chain via the blockchain backend at http://localhost:3000/api/uploadFIR
 */

const args = require('minimist')(process.argv.slice(2));
const fetch = global.fetch || require('node-fetch');

async function main() {
  const token = args.token || process.env.ADMIN_TOKEN;
  const firIdArg = args.firId;

  if (!token) {
    console.error('Admin token is required. Pass --token or set ADMIN_TOKEN env var.');
    process.exit(1);
  }

  try {
    let firId = firIdArg;

    if (!firId) {
      console.log('No FIR id provided — fetching first FIR from main backend...');
      const listRes = await fetch('http://localhost:5000/api/getAllFIRs?limit=1', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!listRes.ok) throw new Error(`Failed to fetch FIRs: ${listRes.status}`);
      const listData = await listRes.json();
      if (!listData.success || !listData.firs || listData.firs.length === 0) {
        throw new Error('No FIRs available to register');
      }
      firId = listData.firs[0]._id;
      console.log('Selected FIR id:', firId);
    }

    // Fetch FIR details
    const firRes = await fetch(`http://localhost:5000/api/getFIR/${firId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!firRes.ok) throw new Error(`Failed to fetch FIR: ${firRes.status}`);
    const firData = await firRes.json();
    if (!firData.success || !firData.fir) throw new Error('Failed to retrieve FIR data');

    console.log('Posting FIR to blockchain backend...');
    const postRes = await fetch('http://localhost:3000/api/uploadFIR', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(firData.fir)
    });

    const result = await postRes.json();
    if (postRes.ok && result.success) {
      console.log('Success! FIR registered on chain.');
      console.log('IPFS hash:', result.ipfsHash || 'N/A');
      console.log('Transaction hash:', result.txHash || result.tx_hash || result.transactionHash || 'N/A');
    } else {
      console.error('Failed to register FIR on chain:', result);
      process.exit(2);
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
