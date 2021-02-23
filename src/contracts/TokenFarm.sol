pragma solidity >=0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    string public name = "DApp Token farm";
    address owner;
    DappToken public dappToken;
    DaiToken public daiToken;

    address[] public stakers;
    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //1. Stake tokens(put money into the app)
    function stakeTokens(uint256 _amount) public {
        //Require amount to be >0
        require(_amount > 0, "Amount cannot be less than 0");
        //So if above statement fails, exception will be raised and remaining function won't run!

        //Transfer mock Dai tokens to token farm from investor for staking
        //msg is a global variable in solidity
        //sender is the one who calls this function
        //this is the tokenFarm itself
        daiToken.transferFrom(msg.sender, address(this), _amount);

        //Update staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        //Add user to stakers array *only* if they haven't staked already
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        //Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    //2. Unstake tokens(withdraw money from the app)

    function unstakeTokens() public {
        //Fetch staking balance
        uint256 balance = stakingBalance[msg.sender];

        //Need balance to be >0
        require(balance > 0, "Staking balance cannot be 0");

        //Transfer mock DAI tokens to this contract for staking
        daiToken.transfer(msg.sender, balance);

        //Reset staking balance to 0 since they're withdrawing all their staked dai tokens
        stakingBalance[msg.sender] = 0;

        //Now that they withdrew the staked dai tokens, they aren't staking so isStaking should be changed to false
        isStaking[msg.sender] = false;
    }

    //3. Issuing tokens(for issuing interest in the form of Dapp tokens)

    function issueTokens() public {
        //If caller is not the owner, this function won't run
        require(msg.sender == owner, "Caller must be the owner");

        //If the person calling this function is the owner, then issue tokens to all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint256 balance = stakingBalance[recipient];
            //Issue 1 DApp token for 1 Mock DAI token staked
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }
}
