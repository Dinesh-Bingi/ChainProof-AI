const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChainProofRegistry", function () {
  let registry;
  let owner;
  let other;

  const hash = ethers.id("sample-content");
  const cid = "QmTest123";
  const title = "My Document";

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("ChainProofRegistry");
    registry = await Factory.deploy();
    await registry.waitForDeployment();
  });

  it("registers a new proof", async function () {
    await expect(registry.connect(owner).registerProof(hash, cid, title)).to.emit(
      registry,
      "ProofRegistered"
    );

    expect(await registry.proofExists(hash)).to.equal(true);
    expect(await registry.totalProofs()).to.equal(1n);
  });

  it("reverts on duplicate registration", async function () {
    await registry.connect(owner).registerProof(hash, cid, title);
    await expect(
      registry.connect(other).registerProof(hash, "QmOther", "Other")
    ).to.be.revertedWithCustomError(registry, "ProofAlreadyExists");
  });

  it("returns proof details", async function () {
    await registry.connect(owner).registerProof(hash, cid, title);
    const [proofOwner, ipfsCid, proofTitle] = await registry.getProof(hash);
    expect(proofOwner).to.equal(owner.address);
    expect(ipfsCid).to.equal(cid);
    expect(proofTitle).to.equal(title);
  });
});
