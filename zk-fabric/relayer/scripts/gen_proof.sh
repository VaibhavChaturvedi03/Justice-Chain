#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CIRCUIT_DIR="$ROOT/circuit"
BUILD_DIR="$CIRCUIT_DIR/build"

# ensure build dir exists
mkdir -p "$BUILD_DIR"

echo "Compiling circuit..."
npx circom "$CIRCUIT_DIR/fir_proof.circom" --r1cs --wasm --sym -o "$BUILD_DIR"

echo "Powers of tau (demo small)..."
npx snarkjs powersoftau new bn128 12 "$BUILD_DIR/pot12_0000.ptau" -v
npx snarkjs powersoftau contribute "$BUILD_DIR/pot12_0000.ptau" "$BUILD_DIR/pot12_0001.ptau" --name="first" -v
npx snarkjs powersoftau prepare phase2 "$BUILD_DIR/pot12_0001.ptau" "$BUILD_DIR/pot12_final.ptau" -v

echo "Generating zkey..."
npx snarkjs groth16 setup "$BUILD_DIR/fir_proof.r1cs" "$BUILD_DIR/pot12_final.ptau" "$BUILD_DIR/fir_proof_0000.zkey"
npx snarkjs zkey contribute "$BUILD_DIR/fir_proof_0000.zkey" "$BUILD_DIR/fir_proof_final.zkey" --name="contrib" -v

echo "Generating witness..."
node "$BUILD_DIR/fir_proof_js/generate_witness.js" "$BUILD_DIR/fir_proof.wasm" "$CIRCUIT_DIR/input.json" "$BUILD_DIR/witness.wtns"

echo "Generating proof..."
npx snarkjs groth16 prove "$BUILD_DIR/fir_proof_final.zkey" "$BUILD_DIR/witness.wtns" "$BUILD_DIR/proof.json" "$BUILD_DIR/public.json"

echo "Export verification key..."
npx snarkjs zkey export verificationkey "$BUILD_DIR/fir_proof_final.zkey" "$BUILD_DIR/verification_key.json"

echo "All done. Proof at $BUILD_DIR/proof.json, public at $BUILD_DIR/public.json"
