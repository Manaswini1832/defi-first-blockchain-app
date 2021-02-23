const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

//accounts argument is an array of all accounts (Visible in ganache)
module.exports = async function(deployer, network, accounts) {

  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

 await deployer.deploy(DappToken);
 const dappToken = await DappToken.deployed();

  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address);
  const tokenFarm = await TokenFarm.deployed();

  //Basically dappTokens passed to token farm so that they can be issued to the investor
  //Transfer 1 million dappTokens to tokenFarm
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000');

  //Transfer 100 Mock daiTokens to investor
  await daiToken.transfer(accounts[1], '100000000000000000000'); 
};
