const fs = require('fs');
const path = require('path');

async function generateABI() {
    try {
        // Đọc compiled contract
        const contractPath = path.join(__dirname, '../artifacts/contracts/FreelancerContract.sol/FreelancerContract.json');
        const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
        
        // Extract ABI
        const abi = contractJson.abi;
        
        // Generate TypeScript file
        const tsContent = `export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export const CONTRACT_ABI = ${JSON.stringify(abi, null, 2)} as const;

export const CONTRACT_STATES = {
    0: 'Pending',
    1: 'Funded',
    2: 'InProgress',
    3: 'Submitted',
    4: 'Completed',
    5: 'Canceled',
    6: 'Disputed'
} as const;
`;

        // Write to config file
        const configPath = path.join(__dirname, '../app/config/contract.ts');
        fs.writeFileSync(configPath, tsContent);
        
        console.log('✅ ABI generated successfully!');
        console.log(`📁 Written to: ${configPath}`);
        console.log(`📊 ABI entries: ${abi.length}`);
        
    } catch (error) {
        console.error('❌ Error generating ABI:', error.message);
    }
}

generateABI();