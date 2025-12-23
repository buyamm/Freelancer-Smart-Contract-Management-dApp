const { ethers } = require("hardhat");

async function main() {
    const freelancerAddress = '0xBcd4042DE499D14e55001CcbB24a551F3b954096';
    const balance = await ethers.provider.getBalance(freelancerAddress);
    console.log('Freelancer Address:', freelancerAddress);
    console.log('Freelancer Balance:', ethers.formatEther(balance), 'ETH');
    
    // Check if this is one of the default accounts
    const accounts = await ethers.getSigners();
    for (let i = 0; i < accounts.length; i++) {
        if (accounts[i].address.toLowerCase() === freelancerAddress.toLowerCase()) {
            console.log(`This is Account #${i}`);
            break;
        }
    }
}

main();