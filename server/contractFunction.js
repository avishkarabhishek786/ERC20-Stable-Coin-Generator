const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const BigNumber = require('bignumber.js');
const paypalPayoutFuncs = require('./paypalPayoutFuncs');

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
    const buyer_signature = resuestData.buyer_signature;
    const order_nonce = parseInt(resuestData.nonce);

    if(purchaser_addr == "" || purchaser_addr == null || typeof purchaser_addr == "undefined"){
      response.status(400).json({"res_code":"-7","res_message":"Purchaser address is invalid","data":purchaser_addr});
    } else if(typeof resuestData.purchase_units !== "object" || typeof resuestData.purchase_units[0] !== "object" 
      || typeof resuestData.purchase_units[0].amount !== "object" ||
      amout_of_tokens == "" || amout_of_tokens == null || typeof amout_of_tokens == "undefined"){
      response.status(400).json({"res_code":"-11","res_message":"USD transferred Is Invalid","data":amout_of_tokens});
    } else if(currency !== "USD") {
        response.status(400).json({"res_code":"-7","res_message":"Currency is not USD","data":currency});
    } else if(typeof buyer_signature !== "string" || buyer_signature.length<1) {
        response.status(400).json({"res_code":"-19","res_message":"Invalid buyer signature","data":buyer_signature});
    } else {
      try{    
          web3.eth.getTransactionCount(CASHIER_ADDRESS, async function(err,nonce) {
            amout_of_tokens = web3.utils.toWei(amout_of_tokens,"ether");
            var buyTokens = TokenInstance.methods.fiat_buy(purchaser_addr, amout_of_tokens, buyer_signature, order_nonce).encodeABI();
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
                response.status(400).json({"res_code":"-1","res_message":"Error While Transferring Token","data":""});
              }
            });
          });

      } catch(error){
        console.log(error);
        response.json({"res_code":"-9","res_message":"Something Went Wrong!","data":""});
      }
    }
  });

  app.post('/fiat_redeem', function(request,response){
    
    const reqestData = request.body.redeem_data;
    if(typeof reqestData !== 'object') {
        response.status(400).json({"res_code":"-7","res_message":"Invalid request","data":request.body});
    }

    const {sellingTokenAmount, payPalEmail, redeemerEthAddr, sellerSignature} = reqestData;

    if(redeemerEthAddr == "" || redeemerEthAddr == null || typeof redeemerEthAddr == "undefined"){
        response.status(400).json({"res_code":"-7","res_message":"Cash redeemer address is invalid","data":redeemerEthAddr});
      } else if(typeof sellingTokenAmount !== "number" || sellingTokenAmount < 1) {
        response.status(400).json({"res_code":"-11","res_message":"Amount of tokens selling must be at least 1.","data":sellingTokenAmount});
      } else if(typeof payPalEmail !== "string" || payPalEmail.length<1) {
          response.status(400).json({"res_code":"-7","res_message":"Invalid email provided.","data":payPalEmail});
      } else if(typeof sellerSignature !== "string" || sellerSignature.length<1) {
        response.status(400).json({"res_code":"-19","res_message":"Invalid seller signature","data":sellerSignature});
    } else {
        console.log(sellingTokenAmount, payPalEmail, redeemerEthAddr, sellerSignature);
        try{    
            web3.eth.getTransactionCount(CASHIER_ADDRESS, async function(err,nonce) {
                if(err) {
                    response.status(400).json({"res_code":"-13","res_message":"System error. Contact administrator.","data":err});
                    return false;
                }
                const amout_of_tokens = web3.utils.toWei(sellingTokenAmount.toString(),"ether");

              // Balance of user must be greater than equal to tokens burning
              const usrBalance = await TokenInstance.methods.balanceOf(redeemerEthAddr).call();  

              let usrBalanceBigNumber = new BigNumber(usrBalance).toNumber();
              let amout_of_tokensBigNumber = new BigNumber(amout_of_tokens).toNumber();
              
              if(usrBalance==0 || usrBalanceBigNumber<amout_of_tokensBigNumber) {
                response.status(400).json({"res_code":"-12","res_message":"You cannot redeem more than your token balance. Your balance is "+usrBalance,"data":""});
                return false;
              }

              const paypal_auth_token = await paypalPayoutFuncs.generarTokenPaypal();
              //console.log(paypal_auth_token);

              if(typeof paypal_auth_token !== "string" || paypal_auth_token.length<1) {
                console.log("auth token empty");
                return;   
              }

              let send_payout = await paypalPayoutFuncs.generarPayoutPaypal(
                  {
                      modo: 'EMAIL',
                      paypal_auth_token: paypal_auth_token,
                      modo_val: payPalEmail,
                      value: sellingTokenAmount
                  }
              );

              if(typeof send_payout =="string") {
                send_payout = JSON.parse(send_payout);
              }
              
              let cash_transferred = false;

              if(typeof send_payout == "object") {
                  if(typeof send_payout.batch_header=="object" && typeof send_payout.batch_header.payout_batch_id=="string") {
                    console.log("Success");
                    cash_transferred = true;
                    // Success: Move to smart contract part
                  } else {
                    console.warn(send_payout.message);
                    // Send error message back to user.
                    response.json({"res_code":"-14","res_message":"Failed to transfer cash! Please try again.","data":send_payout});
                  }
              } else {
                console.warn("Invalid response");
                response.json({"res_code":"-14","res_message":"Failed to transfer cash! Please try again.","data":""});
              }

              if(!cash_transferred) {
                  console.warn("Cash transfer failed");
                  return false;
              }

              const sellTokens = TokenInstance.methods.fiat_redeem(redeemerEthAddr, amout_of_tokens, sellerSignature, reqestData.nonce).encodeABI();
              var rawTransaction = await getRawTransaction(nonce,'','', TOKEN_ADDRESS,'', sellTokens);
              var tx = new EthereumTx(rawTransaction);
              tx.sign(CASHIER_PRIVATE_KEY);
              var serializedTx = tx.serialize();
              const rawTx = '0x' + serializedTx.toString('hex');
  
              //console.log(rawTx);
  
              web3.eth.sendSignedTransaction(rawTx, function(error,hash) {
                if (!error){
                  console.log("Transfer Data = "+hash);
                  response.json({"res_code":"0","res_message":"Tokens Burned Successfully","data":hash});
                }
                else{
                  console.log("Transfer error = "+error);
                  response.status(400).json({"res_code":"-1","res_message":"Error While Burning Tokens","data":""});
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