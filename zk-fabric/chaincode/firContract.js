'use strict';

const { Contract } = require('fabric-contract-api');

class FIRContract extends Contract {
  async initLedger(ctx) {
    
  }
  async createFIR(ctx, firId, reporter, ipfsCid, commitment) {
    const collection = 'collectionFIRs'; 
    const exists = await this.firExists(ctx, firId);
    if (exists) {
      throw new Error(`FIR ${firId} already exists`);
    }
    const fir = {
      id: firId,
      reporter,
      ipfsCid,
      verified: false,
      timestamp: new Date().toISOString()
    };     
    await ctx.stub.putPrivateData(collection, firId, Buffer.from(JSON.stringify(fir)));
    
    await ctx.stub.putState(`FIR_INDEX_${firId}`, Buffer.from(JSON.stringify({ id: firId, commitment })));
    return JSON.stringify(fir);
  }

  async getFIR(ctx, firId) {
    const collection = 'collectionFIRs';
    const data = await ctx.stub.getPrivateData(collection, firId);
    if (!data || data.length === 0) {
      throw new Error(`FIR ${firId} not found in private collection`);
    }
    return data.toString();
  }

  // Read public index
  async getFIRIndex(ctx, firId) {
    const data = await ctx.stub.getState(`FIR_INDEX_${firId}`);
    if (!data || data.length === 0) {
      throw new Error(`FIR index ${firId} not found`);
    }
    return data.toString();
  }

  // Mark verified - restricted to RelayerMSP (change allowedRelayerMSP to your relayer MSP)
  async markVerified(ctx, firId) {
    const mspId = ctx.clientIdentity.getMSPID();
    const allowedRelayerMSP = 'RelayerMSP'; // <<< CHANGE THIS to your relayer MSP id
    if (mspId !== allowedRelayerMSP) {
      throw new Error(`Unauthorized: only ${allowedRelayerMSP} can call markVerified. Caller MSP: ${mspId}`);
    }

    const collection = 'collectionFIRs';
    const data = await ctx.stub.getPrivateData(collection, firId);
    if (!data || data.length === 0) {
      throw new Error(`FIR ${firId} not found`);
    }
    const fir = JSON.parse(data.toString());
    fir.verified = true;
    fir.verifiedBy = ctx.clientIdentity.getID();
    fir.verifiedAt = new Date().toISOString();

    await ctx.stub.putPrivateData(collection, firId, Buffer.from(JSON.stringify(fir)));
    ctx.stub.setEvent('FIRVerified', Buffer.from(JSON.stringify({ id: firId, commitment: fir.commitment })));
    return JSON.stringify(fir);
  }

  async firExists(ctx, firId) {
    const collection = 'collectionFIRs';
    const data = await ctx.stub.getPrivateData(collection, firId);
    return (!!data && data.length > 0);
  }
}

module.exports = FIRContract;
