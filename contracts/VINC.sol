// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol';

contract VINC is Ownable, ERC20Burnable, ERC20Pausable {

    address private initiator=0xbA06B40c222BB9F327193ecC1498FEd34F66d910;
    address private cashier=0x1C3629428864f508FC83C2ff20269a7A6943cDF0;

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
    event Token_purchase_through_fiat(address indexed recipient, uint256 amount);
    event Token_sale_through_fiat(address indexed recipient, uint256 amount);

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) public payable ERC20(_name, _symbol) {
        require(tx.origin != address(0), "Token creator is not a valid address.");
        // Since this token is actually created by TokenFactory msg.sender is TokenFactory 
        // But we want the owner to be person who called TokenFactory i.e tx.origin 
        // So ownership and initial tokens are transferred to tx.origin
        transferOwnership(tx.origin);
        _mint(tx.origin, _initialSupply * (10 ** uint256(decimals())));
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

    // required for token to be burnable and pausable both
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20, ERC20Pausable) {
        super._beforeTokenTransfer(from, to, amount);
    }

    function setCashier(address _cashier) public onlyInitiator {
        cashier = _cashier;
    }

    // function to buy for USD
    function fiat_buy(address recipient, uint256 amount) external onlyCashier returns (bool) {
        require(amount>0, "Token minted must be greater than 0");
        _mint(recipient, amount);
        emit Token_purchase_through_fiat(recipient, amount);
        return true;
    }

    // function to sell tokens for USD
    function fiat_redeem(address recipient, uint256 amount) external onlyCashier returns (bool) {
        require(amount>0, "Cash amount must be greater than 0");
        _burn(recipient, amount);
        emit Token_sale_through_fiat(recipient, amount);
        return true;
    }
    
}