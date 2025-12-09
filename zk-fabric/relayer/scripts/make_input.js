
const fs = require('fs');
const path = require('path');
const circomlibjs = require('circomlibjs');

async function makeInput(a, b, c) {
  const poseidon = await circomlibjs.buildPoseidon();
  const F = poseidon.F;
  const hash = poseidon([BigInt(a), BigInt(b), BigInt(c)]);
  const hashDec = F.toString(hash);

  const input = {
    a: a.toString(),
    b: b.toString(),
    c: c.toString(),
    commitment: hashDec
  };

  const outPath = path.resolve(__dirname, '..', '..', 'circuit', 'input.json');
  fs.writeFileSync(outPath, JSON.stringify(input));
  console.log('Wrote', outPath);
  console.log('commitment (decimal):', hashDec);
}

const args = process.argv.slice(2);
const A = args[0] ? BigInt(args[0]) : 123n;
const B = args[1] ? BigInt(args[1]) : 456n;
const C = args[2] ? BigInt(args[2]) : 789n;

makeInput(A, B, C).catch(err => {
  console.error(err);
  process.exit(1);
});
