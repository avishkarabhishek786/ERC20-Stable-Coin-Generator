'use strict';
//Load files library
var fs = require('fs');
var path = require('path');

const axios = require('axios');//Libreria para manejar servicios rest complejos
const http  = require('https');//Librerias para manejar ser rest
const uniqid = require('uniqid');//Genera ids unicos
require('dotenv').config();

//Funcionalidad que genera un token de paypal
const generarTokenPaypal = async function(){

  try {
    console.log('Ruta activada');
  //Estos datos se pasan a las cabeceras de auth basic para generar el token
  //basic es una auth compleja asi que implemente axios para sacar los datios
  //con desestructuracion de datos
  //username = clientid, password = secret  
  let username = process.env.PAYPAL_CLIENT_ID;
  let password = process.env.PAYPAL_SECRET;

  if(typeof process.env.PAYPAL_CLIENT_ID !=="string" 
  || typeof process.env.PAYPAL_SECRET !=="string") {
    throw new Error("paypal env not set");
  }

  //Funcion para peticion a la api de paypal
    const auth_data= await axios({ //desestruc de datos par aobtener access_token
      url: 'https://api.sandbox.paypal.com/v1/oauth2/token',//cambiar esta url en produccion https://api.paypal.com
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en_US',
        'content-type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: username,//tu username es tu client id
        password: password,//tu password es tu secret
      },
      params: {
        grant_type: 'client_credentials',
      },
    });

    // console.log(auth_data);

    if(typeof auth_data == "object" && typeof auth_data.data == "object"
    && typeof auth_data.data.access_token == "string" && auth_data.data.access_token.length>0) {
        console.log(auth_data.data.access_token);
        return auth_data.data.access_token;
    } else throw new Error("No auth token generated.");

  } catch (error) { 
       console.log('error: ', error);
      return null;
  }

}

const generarPayoutPaypal = async function(params){

    //Params son los paremtros que recibe el cuerpo de la peticion
    //console.log(params);
    let modo       = params.modo;//modo debne ser EMAIL, TELEFONO, PAYPAL ID
    //Dependiendo esta la logica de la peticion cambiara
    let batch_code = uniqid(); //Este codigo lo genere por que cada peticion 
    //te pide generar cun numero de factuiracion unico con esta libreria lo hacemos

    // This comes from the paypal doc
    // Important here you must put in authorizathion: "Bearer" + params.token 
    // to put the new token that is generated each petition
    var options = {
      "method": "POST",
      "hostname": "api.sandbox.paypal.com",
      "port": null,
      "path": "/v1/payments/payouts",
      "headers": {
        "accept": "application/json",
        "authorization": "Bearer "+params.paypal_auth_token,
        "content-type": "application/json"
      }
    };
    
    const payout = function(options) {
        return new Promise((resolve, reject) => {
            let req = http.request(options, function (res) {
                var chunks = [];
                
                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });
            
                res.on("end", function () {
                var body = Buffer.concat(chunks);
                //console.log(body.toString());//Esto te imprime tu respuesta
                //return body.toString();
                    return resolve(body.toString());
                });
            });
            
            //Si modo es tipo EMAIL
    if (modo == 'EMAIL') {
        
        let email          = params.modo_val;//destinatario
        let monto_a_cobrar = params.value;//lo que pagaras

        req.write(JSON.stringify({ sender_batch_header:
            { email_subject: 'Cash Redeem from EDGE196',
              sender_batch_id: 'batch-'+batch_code },//unicode_generardiferentes_ids
           items:
            [ 
             
              { recipient_type: 'EMAIL',//actualmente usando
                amount: { value: monto_a_cobrar, currency: 'USD' },
                receiver: email,
                note: 'Payment through email'
              },
             
            ] }));
         req.end();//FIN DE PETICION

         //console.log(JSON.stringify(req.outputData));
         //regresar respuesta al front
        
    }
    //Si modo es tipo TELEFONO
    if (modo == 'TELEFONO') {
        
        let telefono       = params.modo_val;
        let monto_a_cobrar = params.value;

        req.write(JSON.stringify({ sender_batch_header:
            { email_subject: 'Cash Redeem from EDGE196',
              sender_batch_id: 'batch-'+batch_code },//unicode_generardiferentes_ids
           items:
            [ 
              { recipient_type: 'PHONE',//portelefono
                amount: { value: monto_a_cobrar, currency: 'USD' },
                receiver: telefono,
                note: 'Payment through telefono',//poremail
                sender_item_id: 'item-1-1589160337416' 
              },

            ] }));
         req.end();
         
    }
    //Si modo es tipo PAYPAL_ID
    if (modo == 'PAYPAL_ID') {
        
        let paypal_id      = params.modo_val;
        let monto_a_cobrar = params.value;

        req.write(JSON.stringify({ sender_batch_header:
            { email_subject: 'Cash Redeem from EDGE196',
              sender_batch_id: 'batch-'+batch_code },//unicode_generardiferentes_ids
           items:
            [ 
              { recipient_type: 'PAYPAL_ID',//por idpaypal
                amount: { value: monto_a_cobrar, currency: 'USD' },
                receiver: paypal_id,
                note: 'Payment through paypal id'}
            ] }));
         req.end();
         
    }
    

        });
    };
    
    let send_payout = await payout(options);
    return send_payout;
    
  }

module.exports = {
    generarTokenPaypal, 
    generarPayoutPaypal
}  