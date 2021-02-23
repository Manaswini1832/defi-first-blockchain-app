const { assert } = require("chai");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");
const TokenFarm = artifacts.require("TokenFarm");

require("chai")
    .use(require("chai-as-promised"))
    .should()

function tokens(n){
    return web3.utils.toWei(n, 'ether')
}    


//Args to this is the accounts array. So the first entry is the owner and the second is the investor
contract("TokenFarm", ([owner, investor]) => {
    let daiToken, dappToken, tokenFarm;

    before(async() => {

        //Load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //Transfer 1 million Dapp tokens to token farm
        await dappToken.transfer(tokenFarm.address, tokens('1000000'));

        //Transfer 100 Mock DAI Tokens to the investor
        await daiToken.transfer(investor, tokens('100'), {from: owner})

    })
    
    describe("Mock DAI deployment", async() => {
        it("Has a name", async() => {
            let name = await daiToken.name()
            assert.equal(name, "Mock DAI Token")
        })
    })

    describe("DApp deployment", async() => {
        it("Has a name", async() => {
            let name = await dappToken.name()
            assert.equal(name, "DApp Token")
        })
    })

    describe("Token farm deployment", async() => {
        it("Has a name", async() => {
            let name = await tokenFarm.name()
            assert.equal(name, "DApp Token farm")
        })

        //To check if the token farm received 1 million tokens
        it("contract has tokens", async() => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe("Farming tokens", async() => {
        it("rewards investors for staking mDai Tokens", async() => {
            let result

            //Check investor balance before staking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor mock DAI wallet balance correct before staking')
                 
            //Stake mock DAI tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor })
            await tokenFarm.stakeTokens(tokens('100'), { from: investor })

            //Check staking result

            //Investor should now have 0 DAI tokens since they staked all of them acc to the test
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'Investor mock DAI wallet balance correct after staking')

            //And the token farm should now have 100 dai tokens since investor invested all of them acc to the test
            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token farm mock DAI balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

            //Issue tokesn
            await tokenFarm.issueTokens({ from: owner })

            //Checking balances after issuance
            //i.e.since they invested 100 dai before, they should be issued 100 dapp
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor DApp token balance correct after issuance')

            //Ensure that only the owner can issue tokens
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            //Unstake tokens
            await tokenFarm.unstakeTokens({ from: investor })

            //Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'investor DAI token wallet balance correct after unstaking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token farm mock DAI wallet balance correct after unstaking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after unstaking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after unstaking')



        })
    })
})