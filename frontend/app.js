window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        // Initialize Web3
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Set up the contract
        const contractABI = [/* Paste your contract ABI here */];
        const contractAddress = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B"; // Replace with your contract address
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Get accounts
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];

        // Handle Create Campaign
        document.getElementById('createCampaignForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const description = document.getElementById('description').value;
            const goal = document.getElementById('goal').value;

            try {
                const result = await contract.methods.createCampaign(description, web3.utils.toWei(goal, 'ether'))
                    .send({ from: currentAccount });
                console.log(result);
                alert('Campaign created successfully!');
            } catch (error) {
                console.error(error);
                alert('Error creating campaign');
            }
        });

        // Handle Donation
        document.getElementById('donateForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const campaignId = document.getElementById('campaignId').value;
            const amount = document.getElementById('donationAmount').value;

            try {
                const result = await contract.methods.donate(campaignId)
                    .send({ from: currentAccount, value: web3.utils.toWei(amount, 'ether') });
                console.log(result);
                alert('Donation successful!');
            } catch (error) {
                console.error(error);
                alert('Error donating');
            }
        });

        // Display Campaigns
        const displayCampaigns = async () => {
            const campaignCount = await contract.methods.campaignCount().call();
            const campaignList = document.getElementById('campaignList');
            campaignList.innerHTML = '';

            for (let i = 1; i <= campaignCount; i++) {
                const campaign = await contract.methods.campaigns(i).call();
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');
                listItem.innerHTML = `
                    <strong>${campaign.description}</strong><br>
                    Goal: ${web3.utils.fromWei(campaign.goal, 'ether')} ETH<br>
                    Raised: ${web3.utils.fromWei(campaign.amountRaised, 'ether')} ETH
                `;
                campaignList.appendChild(listItem);
            }
        };

        displayCampaigns();
    } else {
        alert('Please install MetaMask or another Web3 wallet to use this app.');
    }
});
