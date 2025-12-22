const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FreelancerContract...");

  const FreelancerContract = await ethers.getContractFactory("FreelancerContract");
  const freelancerContract = await FreelancerContract.deploy();

  await freelancerContract.waitForDeployment();

  const contractAddress = await freelancerContract.getAddress();
  console.log("FreelancerContract deployed to:", contractAddress);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });