// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JusticeChain {
    struct FIR {
        uint id;
        string title;
        string description;
        uint severity;
        string ipfsHash;
        uint timestamp;

        // Incident Details
        string incidentType;
        string incidentDate;
        string incidentTime;
        string incidentLocation;
        string incidentDescription;
        string suspectDetails;
        string witnessDetails;
        string evidenceDescription;
    }

    FIR[] public firs;

    event FIRCreated(
        uint id,
        string title,
        uint severity,
        string ipfsHash,
        uint timestamp,
        string incidentType,
        string incidentDate,
        string incidentTime,
        string incidentLocation,
        string incidentDescription,
        string suspectDetails,
        string witnessDetails,
        string evidenceDescription
    );

    constructor() {}

    function createFIR(
        string memory _title,
        string memory _description,
        uint _severity,
        string memory _ipfsHash,
        string memory _incidentType,
        string memory _incidentDate,
        string memory _incidentTime,
        string memory _incidentLocation,
        string memory _incidentDescription,
        string memory _suspectDetails,
        string memory _witnessDetails,
        string memory _evidenceDescription
    ) public {
        require(_severity >= 1 && _severity <= 5, "Invalid severity");

        FIR memory newFIR = FIR({
            id: firs.length,
            title: _title,
            description: _description,
            severity: _severity,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            incidentType: _incidentType,
            incidentDate: _incidentDate,
            incidentTime: _incidentTime,
            incidentLocation: _incidentLocation,
            incidentDescription: _incidentDescription,
            suspectDetails: _suspectDetails,
            witnessDetails: _witnessDetails,
            evidenceDescription: _evidenceDescription
        });

        firs.push(newFIR);

        emit FIRCreated(
            newFIR.id,
            _title,
            _severity,
            _ipfsHash,
            newFIR.timestamp,
            _incidentType,
            _incidentDate,
            _incidentTime,
            _incidentLocation,
            _incidentDescription,
            _suspectDetails,
            _witnessDetails,
            _evidenceDescription
        );
    }

    function getAllFIRs() public view returns (FIR[] memory) {
        return firs;
    }

    function getFIR(uint _id) public view returns (FIR memory) {
        require(_id < firs.length, "FIR does not exist");
        return firs[_id];
    }

    function getTotalFIRs() public view returns (uint) {
        return firs.length;
    }

    function viewFIR(uint _id)
        public
        view
        returns (
            uint id,
            string memory title,
            string memory description,
            uint severity,
            string memory ipfsHash,
            uint timestamp,
            string memory incidentType,
            string memory incidentDate,
            string memory incidentTime,
            string memory incidentLocation,
            string memory incidentDescription,
            string memory suspectDetails,
            string memory witnessDetails,
            string memory evidenceDescription
        )
    {
        require(_id < firs.length, "FIR does not exist");
        FIR memory f = firs[_id];

        return (
            f.id,
            f.title,
            f.description,
            f.severity,
            f.ipfsHash,
            f.timestamp,
            f.incidentType,
            f.incidentDate,
            f.incidentTime,
            f.incidentLocation,
            f.incidentDescription,
            f.suspectDetails,
            f.witnessDetails,
            f.evidenceDescription
        );
    }
}
