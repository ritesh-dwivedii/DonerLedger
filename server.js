const express = require('express');
const Web3 = require('web3');
require('dotenv').config();

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());


// Check if INFURA_URL, CONTRACT_ADDRESS, and PRIVATE_KEY are defined
if (!process.env.INFURA_URL) {
    console.error("INFURA_URL is not defined in the .env file.");
    process.exit(1);
}

if (!process.env.CONTRACT_ADDRESS) {
    console.error("CONTRACT_ADDRESS is not defined in the .env file.");
    process.exit(1);
}

if (!process.env.PRIVATE_KEY) {
    console.error("PRIVATE_KEY is not defined in the .env file.");
    process.exit(1);
}

// Initialize Web3 with the Infura URL
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

// Replace with your contract's ABI
const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "creator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "goal",
                "type": "uint256"
            }
        ],
        "name": "CampaignCreated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "_goal",
                "type": "uint256"
            }
        ],
        "name": "createCampaign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_campaignId",
                "type": "uint256"
            }
        ],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "DonationReceived",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "campaignCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "campaigns",
        "outputs": [
            {
                "internalType": "address payable",
                "name": "creator",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "goal",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amountRaised",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];


// Load contract address from .env file
const contractAddress = process.env.CONTRACT_ADDRESS;

// Validate contract address
if (!web3.utils.isAddress(contractAddress)) {
    console.error("Invalid contract address:", contractAddress);
    process.exit(1);
}

// Initialize contract with ABI and address
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Retrieve the private key from the environment variable
const privateKey = process.env.PRIVATE_KEY;

// Convert private key to account object
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);
const fromAddress = account.address; // Address to send from

app.use(express.json());

// API to create a new campaign
app.post('/createCampaign', async (req, res) => {
    try {
        const { description, goal } = req.body;

        // Build the transaction
        const tx = contract.methods.createCampaign(description, goal);
        const gas = await tx.estimateGas({ from: fromAddress });

        const txData = {
            from: fromAddress,
            to: contractAddress,
            data: tx.encodeABI(),
            gas: gas
        };

        // Sign and send the transaction
        const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        res.json(receipt);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.toString());
    }
});

// API to donate to a campaign
app.post('/donate', async (req, res) => {
    try {
        const { campaignId, amount } = req.body;

        // Build the donation transaction
        const tx = contract.methods.donate(campaignId);
        const gas = await tx.estimateGas({ from: fromAddress });

        const txData = {
            from: fromAddress,
            to: contractAddress,
            data: tx.encodeABI(),
            value: web3.utils.toWei(amount, 'ether'),
            gas: gas
        };

        // Sign and send the transaction
        const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

        res.json(receipt);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.toString());
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
