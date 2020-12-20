// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol';

contract VINC is ERC20Pausable, Ownable {

    address private vinc_owner;
    
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) public ERC20(_name, _symbol) {
        _mint(msg.sender, _initialSupply);
        vinc_owner = msg.sender;
    }
    
    function transfer(address recipient, uint256 amount) public virtual override whenNotPaused returns (bool) {
        super.transfer(recipient, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) public virtual override whenNotPaused returns (bool) {
        super.transferFrom(sender, recipient, amount);
        return true;
    }
    
    function stop() public {
        super._pause();
    }
    
    function start() public {
        super._unpause();
    }
    
}