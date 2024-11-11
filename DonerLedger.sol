// DonerLedger.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonerLedger {
    struct Campaign {
        address payable creator;
        string description;
        uint goal;
        uint amountRaised;
    }

    mapping(uint => Campaign) public campaigns;
    uint public campaignCount;

    event CampaignCreated(uint id, address creator, uint goal);
    event DonationReceived(uint id, address donor, uint amount);

    function createCampaign(string memory _description, uint _goal) public {
        campaignCount++;
        campaigns[campaignCount] = Campaign(payable(msg.sender), _description, _goal, 0);
        emit CampaignCreated(campaignCount, msg.sender, _goal);
    }

    function donate(uint _campaignId) public payable {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.value > 0, "Donation must be greater than 0");
        require(campaign.amountRaised < campaign.goal, "Campaign already funded");

        campaign.amountRaised += msg.value;
        campaign.creator.transfer(msg.value);

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }
}
