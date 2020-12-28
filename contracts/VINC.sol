// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol';

contract VINC is ERC20Pausable, Ownable {

    address private vinc_owner;
    
    mapping (address => mapping (address => uint256)) private _expected_receiving_tokens;
    
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
    
    // Set a minimum amount you must receive from buyer address in a trade
    function set_expected_receiving_tokens(address buyer, uint256 amount) external onlyOwner {
        require(vinc_owner != address(0), "ERC20: trading from the zero address");
        require(buyer != address(0), "ERC20: trading to the zero address");

        _expected_receiving_tokens[vinc_owner][buyer] = amount;
        emit Set_receiving_tokens(vinc_owner, buyer, amount);
    }
    
    event Set_receiving_tokens(address indexed owner, address indexed buyer, uint256 value);
    
    // amount that owner should get from buyer in a trade
    function expected_receiving_tokens(address buyer) public view returns (uint256) {
        return _expected_receiving_tokens[vinc_owner][buyer];
    }
    
}