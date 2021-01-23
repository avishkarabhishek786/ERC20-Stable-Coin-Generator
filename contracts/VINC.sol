// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol';

contract VINC is ERC20Pausable, Ownable {

    address private initiator;
    address private cashier;

    modifier onlyInitiator() {
        require(msg.sender==initiator);
        _;
    }

    modifier onlyCashier() {
        require(msg.sender==cashier);
        _;
    }
    
    mapping (address => mapping (address => uint256)) private _expected_receiving_tokens;

    event Set_receiving_tokens(address indexed owner, address indexed buyer, uint256 value);
    event Token_purchase_through_fiat(address indexed sender, address indexed recipient, uint256 amount);

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) public payable ERC20(_name, _symbol) {
        require(tx.origin != address(0), "Token creator is not a valid address.");
        // Since this token is actually created by TokenFactory msg.sender is TokenFactory 
        // But we want the owner to be person who called TokenFactory i.e tx.origin 
        // So ownership and initial tokens are transferred to tx.origin
        transferOwnership(tx.origin);
        _mint(tx.origin, _initialSupply);
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
    function set_expected_receiving_tokens(address buyer, uint256 amount) external {
        require(_msgSender() != address(0), "ERC20: trading from the zero address");
        require(buyer != address(0), "ERC20: trading to the zero address");

        _expected_receiving_tokens[_msgSender()][buyer] = amount;
        emit Set_receiving_tokens(_msgSender(), buyer, amount);
    }
    
    // amount that owner should get from buyer in a trade
    function expected_receiving_tokens(address receiver, address sender) public view returns (uint256) {
        return _expected_receiving_tokens[receiver][sender];
    }

    function setCashier(address _cashier) public onlyInitiator {
        cashier = _cashier;
    }

    // function to buy for USD
    function fiat_buy(address sender, address recipient, uint256 amount) external onlyCashier returns (bool) {
        transferFrom(sender, recipient, amount);
        emit Token_purchase_through_fiat(sender, recipient, amount);
        return true;
    }
    
}