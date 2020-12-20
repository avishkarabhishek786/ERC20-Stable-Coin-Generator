// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract VINC is ERC20 {

    address private owner;
    
    bool stopped = false;
    
    modifier isRunning {
        assert (!stopped);
        _;
    }

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) public ERC20(_name, _symbol) {
        _mint(msg.sender, _initialSupply);
        owner = msg.sender;
    }
    
    function transferToken(address recipient, uint256 amount) public isRunning returns (bool) {
        transfer(recipient, amount);
        return true;
    }
    
    function transferTokenFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        transferFrom(sender, recipient, amount);
        return true;
    }
    

}