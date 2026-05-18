const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying ChainProofRegistry with:", deployer.address);

  const Registry = await hre.ethers.getContractFactory("ChainProofRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("ChainProofRegistry deployed to:", address);

  const outDir = path.join(__dirname, "../../backend/src/config");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "contract-address.json"),
    JSON.stringify({ ChainProofRegistry: address, network: hre.network.name }, null, 2)
  );

  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/ChainProofRegistry.sol/ChainProofRegistry.json"
  );
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(path.join(outDir, "contract-abi.json"), JSON.stringify(artifact.abi, null, 2));
    console.log("Wrote contract ABI to backend/src/config/contract-abi.json");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
