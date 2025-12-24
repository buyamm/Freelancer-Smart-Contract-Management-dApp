const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FreelancerContract - Modular Architecture", function () {
    let freelancerContract;
    let owner, client, freelancer;

    beforeEach(async function () {
        [owner, client, freelancer] = await ethers.getSigners();
        
        const FreelancerContract = await ethers.getContractFactory("FreelancerContract");
        freelancerContract = await FreelancerContract.deploy();
        await freelancerContract.waitForDeployment();
    });

    it("Should deploy successfully", async function () {
        expect(await freelancerContract.getAddress()).to.be.properAddress;
    });

    it("Should create a job successfully", async function () {
        const title = "Test Job";
        const description = "Test Description";
        const deadline = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
        const payment = ethers.parseEther("1.0");

        await expect(
            freelancerContract.connect(client).createJob(title, description, deadline, { value: payment })
        ).to.emit(freelancerContract, "ContractCreated");

        const job = await freelancerContract.getJob(1);
        expect(job.title).to.equal(title);
        expect(job.client).to.equal(client.address);
        expect(job.payment).to.equal(payment);
    });

    it("Should update contact info successfully", async function () {
        const name = "John Doe";
        const email = "john@example.com";
        const phone = "123456789";
        const chatLink = "https://t.me/johndoe";

        await expect(
            freelancerContract.connect(client).updateContactInfo(name, email, phone, chatLink)
        ).to.emit(freelancerContract, "ContactInfoUpdated");

        const contactInfo = await freelancerContract.getContactInfo(client.address);
        expect(contactInfo.name).to.equal(name);
        expect(contactInfo.email).to.equal(email);
    });
});