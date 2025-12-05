// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JusticeChain {
    struct FIR {
        uint id;
        string title;
        string description;
        uint severity;
        string ipfsHash;           
        string incidentDetailsJson; 
        uint timestamp;
    }

    uint public firCount;
    mapping(uint => FIR) private firs;

    event FIRCreated(
        uint id,
        string title,
        uint severity,
        string ipfsHash,
        uint timestamp
    );

    constructor() {}

    function createFIR(
        string memory _title,
        string memory _description,
        uint _severity,
        string memory _ipfsHash,
        string memory _incidentDetailsJson
    ) public {
        require(_severity >= 1 && _severity <= 5, "Invalid severity");

        uint id = firCount;
        firCount++;

        firs[id] = FIR({
            id: id,
            title: _title,
            description: _description,
            severity: _severity,
            ipfsHash: _ipfsHash,
            incidentDetailsJson: _incidentDetailsJson,
            timestamp: block.timestamp
        });

        emit FIRCreated(id, _title, _severity, _ipfsHash, block.timestamp);
    }

    function getFIR(uint _id) public view returns (FIR memory) {
        require(_id < firCount, "FIR does not exist");
        return firs[_id];
    }

    function getTotalFIRs() public view returns (uint) {
        return firCount;
    }
}
