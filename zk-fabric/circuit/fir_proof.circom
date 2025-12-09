pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";

template FIRProof() {
    // Private inputs (example uses 3 field elements; pack your preimage accordingly)
    signal input a;
    signal input b;
    signal input c;

    signal input preimage[3];
    preimage[0] <== a;
    preimage[1] <== b;
    preimage[2] <== c;

    component pose = Poseidon(3);
    for (var i = 0; i < 3; i++) {
        pose.inputs[i] <== preimage[i];
    }

    signal output out;
    out <== pose.out;

    // Public input: commitment (must equal out)
    signal input commitment;
    out === commitment;
}

component main = FIRProof();
