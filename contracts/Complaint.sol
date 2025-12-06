// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ComplaintRegistry {
    struct Complaint {
        uint id;
        address citizen;
        string incidentType;
        string incidentDate;
        string incidentTime;
        string incidentLocation;
        string incidentDescription;
        string suspectDetails;
        string witnessDetails;
        string evidenceDescription;
        uint timestamp;
    }

    uint public complaintCount;
    mapping(uint => Complaint) private complaints;

    event ComplaintFiled(
        uint indexed id,
        address indexed citizen,
        string incidentType,
        string incidentDate,
        string incidentTime,
        string incidentLocation,
        uint timestamp
    );

    // Citizen files a complaint (call this when they click "Submit" on dashboard)
    function fileComplaint(
        string memory _incidentType,
        string memory _incidentDate,
        string memory _incidentTime,
        string memory _incidentLocation,
        string memory _incidentDescription,
        string memory _suspectDetails,
        string memory _witnessDetails,
        string memory _evidenceDescription
    ) public {
        uint id = complaintCount;
        complaintCount++;

        complaints[id] = Complaint({
            id: id,
            citizen: msg.sender,
            incidentType: _incidentType,
            incidentDate: _incidentDate,
            incidentTime: _incidentTime,
            incidentLocation: _incidentLocation,
            incidentDescription: _incidentDescription,
            suspectDetails: _suspectDetails,
            witnessDetails: _witnessDetails,
            evidenceDescription: _evidenceDescription,
            timestamp: block.timestamp
        });

        emit ComplaintFiled(
            id,
            msg.sender,
            _incidentType,
            _incidentDate,
            _incidentTime,
            _incidentLocation,
            block.timestamp
        );
    }

    // Basic info getter
    function getComplaintBasic(
        uint _id
    )
        public
        view
        returns (
            uint id,
            address citizen,
            string memory incidentType,
            string memory incidentDate,
            string memory incidentTime,
            string memory incidentLocation,
            uint timestamp
        )
    {
        require(_id < complaintCount, "Complaint does not exist");
        Complaint storage c = complaints[_id];

        return (
            c.id,
            c.citizen,
            c.incidentType,
            c.incidentDate,
            c.incidentTime,
            c.incidentLocation,
            c.timestamp
        );
    }

    // Detailed text fields getter
    function getComplaintDetails(
        uint _id
    )
        public
        view
        returns (
            string memory incidentDescription,
            string memory suspectDetails,
            string memory witnessDetails,
            string memory evidenceDescription
        )
    {
        require(_id < complaintCount, "Complaint does not exist");
        Complaint storage c = complaints[_id];

        return (
            c.incidentDescription,
            c.suspectDetails,
            c.witnessDetails,
            c.evidenceDescription
        );
    }

    function getTotalComplaints() public view returns (uint) {
        return complaintCount;
    }
}
