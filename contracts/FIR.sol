// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract JusticeChain is ERC721URIStorage {
    uint256 private _nextTokenId;
    address public police; // deployer = police

    struct FIR {
        uint256 id;          // same as tokenId
        string title;
        string description;
        uint256 severity;
        string ipfsHash;     // IPFS hash of FIR JSON
        uint256 timestamp;   // createdAt
        bool isOpen;
        uint256 closedAt;
    }

    FIR[] public firs;  // keeps all FIR records

    // tokenId => index in `firs` array + 1 (0 means "does not exist")
    mapping(uint256 => uint256) private _tokenIndexPlusOne;

    event FIRCreated(
        uint256 indexed id,
        string title,
        string description,
        uint256 severity,
        string ipfsHash,
        uint256 timestamp,
        address indexed citizen,
        string tokenURI
    );

    event FIRClosed(
        uint256 indexed id,
        address indexed closedBy
    );

    modifier onlyPolice() {
        require(msg.sender == police, "Not authorized");
        _;
    }

    constructor() ERC721("JusticeChain FIR", "JFIR") {
        police = msg.sender;
    }

    function getFirByToken(uint256 tokenId) external view returns (FIR memory) {
        uint256 idxPlusOne = _tokenIndexPlusOne[tokenId];
        require(idxPlusOne != 0, "FIR does not exist");
        return firs[idxPlusOne - 1];
    }

    /// @notice Mint an FIR NFT and store full FIR struct
    function mintFir(
        address citizen,
        string memory title,
        string memory description,
        uint256 severity,
        string memory ipfsHash,
        string memory metadataUri   // tokenURI (usually ipfs://...)
    ) external onlyPolice returns (uint256) {
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(bytes(title).length > 0, "Title required");
        require(severity > 0, "Severity required");

        _nextTokenId += 1;
        uint256 tokenId = _nextTokenId;

        _safeMint(citizen, tokenId);
        _setTokenURI(tokenId, metadataUri);

        FIR memory f = FIR({
            id: tokenId,
            title: title,
            description: description,
            severity: severity,
            ipfsHash: ipfsHash,
            timestamp: block.timestamp,
            isOpen: true,
            closedAt: 0
        });

        firs.push(f);
        _tokenIndexPlusOne[tokenId] = firs.length; // store index+1

        emit FIRCreated(
            tokenId,
            title,
            description,
            severity,
            ipfsHash,
            f.timestamp,
            citizen,
            metadataUri
        );

        return tokenId;
    }

    /// @notice Close a case and burn the NFT
    function closeFir(uint256 tokenId) external onlyPolice {
        uint256 idxPlusOne = _tokenIndexPlusOne[tokenId];
        require(idxPlusOne != 0, "FIR does not exist");

        uint256 index = idxPlusOne - 1;
        FIR storage f = firs[index];

        require(f.isOpen, "Already closed");

        f.isOpen = false;
        f.closedAt = block.timestamp;

        _burn(tokenId);

        emit FIRClosed(tokenId, msg.sender);
    }
}
