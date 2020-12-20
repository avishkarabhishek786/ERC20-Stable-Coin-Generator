// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract VINC is ERC20, Ownable {

    address private vinc_owner;
    
    bool stopped = false;
    
    modifier isRunning {
        assert (!stopped);
        _;
    }

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) public ERC20(_name, _symbol) {
        _mint(msg.sender, _initialSupply);
        vinc_owner = msg.sender;
    }
    
    function stop() public onlyOwner {
        stopped = true;
    }

    function start() public onlyOwner {
        stopped = false;
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