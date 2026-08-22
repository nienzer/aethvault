require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: { optimizer: { enabled: true, runs: 200 } }
      },
      {
        version: "0.8.24",
        settings: { optimizer: { enabled: true, runs: 200 } }
      }
    ]
  },
  networks: {
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: [
        process.env.PK_DEPLOYER,
        process.env.PK_TREASURY,
        process.env.PK_TEAM,
        process.env.PK_STAKING,
        process.env.PK_SALE
      ]
    }
  },
  etherscan: {
    // 🛡️ AMAN: Menggunakan process.env agar tidak terekspos di GitHub
    apiKey: process.env.BSCSCAN_API_KEY
  }
};