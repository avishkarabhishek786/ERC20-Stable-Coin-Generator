const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

var app = express.Router();
var Web3 = require('web3');
var EthereumTx = require('ethereumjs-tx').Transaction;
const TOKEN_JSON = require("../client/src/abis/VINC.json");

require('dotenv').config();

if(typeof process.env.CASHIER_PRIVATE_KEY !=="string") {
    return console.error("env not set");
}

const CASHIER_PRIVATE_KEY = Buffer.from(process.env.CASHIER_PRIVATE_KEY, 'hex');
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;
const CASHIER_ADDRESS = process.env.CASHIER_ADDRESS;

let web3;
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
}

var BN = web3.utils.BN;
app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const TokenInstance = new web3.eth.Contract(TOKEN_JSON.abi, TOKEN_ADDRESS);

async function getRawTransaction(_address, _gasPrice, _gasLimit, _to, _value, _data){
    var rawData = {
        nonce: web3.utils.toHex(_address),
        gasPrice: (_gasPrice != "" && typeof _gasPrice != "undefined") ? web3.utils.toHex(_gasPrice) : '0x4e3b29200',
        gasLimit: (_gasLimit != "" && typeof _gasLimit != "undefined") ? web3.utils.toHex(_gasLimit) : '0x3d090',
        to: _to,
        value: (_value != "" && typeof _value != "undefined") ? web3.utils.toHex(web3.utils.toWei(_value,"ether")) : '0x00',
        data: (_data != "" && typeof _data != "undefined") ? _data : ''
    }
    return rawData;
  }

app.post('/foo', function(request,response) {
    let amout_of_tokens = Number(request.body.num);
    console.log(request.body.num);
    console.log(amout_of_tokens);
    amout_of_tokens = new BN(amout_of_tokens).toString();
    console.log(amout_of_tokens);
    console.log(web3.utils.toWei(amout_of_tokens,"ether"));
});  

app.post('/fiat_buy', function(request,response){
    
    const resuestData = request.body.puchase_data;
    if(typeof resuestData !== 'object') {
        response.status(400).json({"res_code":"-7","res_message":"Invalid request","data":request.body});
    }
    const purchaser_addr = resuestData.purchaser_eth_address;
    let amout_of_tokens = resuestData.purchase_units[0].amount["value"];
    const currency = resuestData.purchase_units[0].amount["currency_code"];

    if(purchaser_addr == "" || purchaser_addr == null || typeof purchaser_addr == "undefined"){
      response.status(400).json({"res_code":"-7","res_message":"Purchaser address is invalid","data":purchaser_addr});
    } else if(typeof resuestData.purchase_units !== "object" || typeof resuestData.purchase_units[0] !== "object" 
      || typeof resuestData.purchase_units[0].amount !== "object" ||
      amout_of_tokens == "" || amout_of_tokens == null || typeof amout_of_tokens == "undefined"){
      response.status(400).json({"res_code":"-11","res_message":"USD transferred Is Invalid","data":amout_of_tokens});
    } else if(currency !== "USD") {
        response.status(400).json({"res_code":"-7","res_message":"Currency is not USD","data":currency});
    } else {
      try{    
          console.log("ok");
          web3.eth.getTransactionCount(CASHIER_ADDRESS, async function(err,nonce) {
            amout_of_tokens = web3.utils.toWei(amout_of_tokens,"ether");
            var buyTokens = TokenInstance.methods.fiat_buy(purchaser_addr, amout_of_tokens).encodeABI();
            var rawTransaction = await getRawTransaction(nonce,'','', TOKEN_ADDRESS,'',buyTokens);
            var tx = new EthereumTx(rawTransaction);
            tx.sign(CASHIER_PRIVATE_KEY);
            var serializedTx = tx.serialize();
            const rawTx = '0x' + serializedTx.toString('hex');

            console.log(rawTx);

            web3.eth.sendSignedTransaction(rawTx, function(error,hash) {
              if (!error){
                console.log("Transfer Data = "+hash);
                response.json({"res_code":"0","res_message":"Tokens Transfer Successfully","data":hash});
              }
              else{
                console.log("Transfer error = "+error);
                response.status(400).json({"res_code":"-1","res_message":"Error While Transferring EEZOToken","data":""});
              }
            });
          });

      } catch(error){
        console.log(error);
        response.json({"res_code":"-9","res_message":"Something Went Wrong!","data":""});
      }
    }
  });

  module.exports = app;