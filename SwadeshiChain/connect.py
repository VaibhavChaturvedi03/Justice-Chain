from web3 import Web3
import json

# -----------------------------
# CONFIG
# -----------------------------

RPC_URL = "https://sepolia.infura.io/v3/542f1eaa832d48f7b99c34caca33add7"  # <-- paste here
CONTRACT_ADDRESS = "0x0019C4D21966f151d84633BF6347BB4ecEE936EE"                 # <-- paste here
PRIVATE_KEY = "0xe425cf9d9200b5ed94e7abae0aefdbe805ac43c95c32576d1236ba915a9e3498"                           # <-- paste here

# Your public address (derived from MetaMask private key)
web3 = Web3(Web3.HTTPProvider(RPC_URL))
account = web3.eth.account.from_key(PRIVATE_KEY)
SENDER = account.address

print("Connected to Sepolia:", web3.is_connected())
print("Police Account:", SENDER)

# -----------------------------
# LOAD ABI
# -----------------------------
with open("abi.json") as f:    # save your ABI to abi.json
    ABI = json.load(f)

contract = web3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

# -----------------------------
# MINT FIR FUNCTION
# -----------------------------
def mint_fir():
    title = "Test FIR Title"
    description = "This is an example FIR created from Python"
    severity = 5
    ipfsHash = "QmExampleCID123456"
    metadataUri = "ipfs://QmExampleMetadata"

    nonce = web3.eth.get_transaction_count(SENDER)

    txn = contract.functions.mintFir(
        SENDER,        # citizen = police for test
        title,
        description,
        severity,
        ipfsHash,
        metadataUri
    ).build_transaction({
        "from": SENDER,
        "nonce": nonce,
        "gas": 500000,                         # enough for mint
        "maxFeePerGas": web3.to_wei("30", "gwei"),
        "maxPriorityFeePerGas": web3.to_wei("2", "gwei"),
        "chainId": 11155111                    # Sepolia chain ID
    })

    # Sign transaction
    signed_txn = web3.eth.account.sign_transaction(txn, PRIVATE_KEY)

    # Send
    tx_hash = web3.eth.send_raw_transaction(signed_txn.raw_transaction)

    print("Transaction sent:", tx_hash.hex())
    receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
    print("Mined in block:", receipt.blockNumber)


# -----------------------------
# READ FIR
# -----------------------------
def get_fir(id):
    fir = contract.functions.getFirByToken(id).call()
    print("FIR data:", fir)


# -----------------------------
# RUN
# -----------------------------
mint_fir()
get_fir(1)
