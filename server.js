
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

const { createContext, CryptoFactory } = require("sawtooth-sdk/signing");
const crypto = require("crypto");
const { protobuf } = require("sawtooth-sdk");
const fetch = require("node-fetch");
const context = createContext("secp256k1");
const { TextEncoder, TextDecoder } = require("text-encoding/lib/encoding");
const privateKey = context.newRandomPrivateKey();
const cryptoFact = new CryptoFactory(context);
const signer = cryptoFact.newSigner(privateKey);

const ShippingPayload = require("./src/payload");
    
const _hash = (x) =>
  crypto
    .createHash("sha512")
    .update(x)
    .digest("hex")
    .toLowerCase()
    .substring(0, 64);

const SHIPPING_FAMILY = "shipping";
const SHIPPING_NAMESPACE = _hash(SHIPPING_FAMILY).substring(0, 6);
const _makeShippingAddress = (x) => SHIPPING_NAMESPACE + _hash(x);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use((_, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Allow-Headers', '*');
	next();
});


process.on( 'SIGINT', async function() {
	console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
	process.exit();
});


const block = function (_package_id, _action, _location, _name, _time) {
  console.log(_package_id, _action, _location, _name)
    
    const createTransaction = (payload) => {
      const [packageID, action, location, name, time] = payload.split(",");
      const encoder = new TextEncoder("utf8");
      const payloadBytes = encoder.encode(payload);
      const transactionHeaderBytes = protobuf.TransactionHeader.encode({
        familyName: SHIPPING_FAMILY,
        familyVersion: "1.0",
        inputs: [_makeShippingAddress(packageID)],
        outputs: [_makeShippingAddress(packageID)],
        signerPublicKey: signer.getPublicKey().asHex(),
        // In this example, we're signing the batch with the same private key,
        // but the batch can be signed by another party, in which case, the
        // public key will need to be associated with that key.
        batcherPublicKey: signer.getPublicKey().asHex(),
        // In this example, there are no dependencies.  This list should include
        // an previous transaction header signatures that must be applied for
        // this transaction to successfully commit.
        // For example,
        // dependencies: ['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
        dependencies: [],
        nonce: "" + Math.random(),
        payload_encoding: "utf8",
        payloadSha512: crypto
          .createHash("sha512")
          .update(payloadBytes)
          .digest("hex"),
      }).finish();
    
    
    
      // const signature = signer.sign(transactionHeaderBytes);
    
      const transaction = protobuf.Transaction.create({
        header: transactionHeaderBytes,
        headerSignature: signer.sign(transactionHeaderBytes),
        payload: payloadBytes,
      });
      return transaction;
    };
    
    const createBatch = (transactions) => {
      const batchHeaderBytes = protobuf.BatchHeader.encode({
        signerPublicKey: signer.getPublicKey().asHex(),
        transactionIds: transactions.map((txn) => txn.headerSignature),
      }).finish();
    
      // const signature = signer.sign(batchHeaderBytes);
    
      const batch = protobuf.Batch.create({
        header: batchHeaderBytes,
        headerSignature: signer.sign(batchHeaderBytes),
        transactions: transactions,
      });
      return batch;
    };
    
    /* This batch creates a new game */
    const batchToSend = createBatch([createTransaction(`${_package_id},${_action},${_location},${_name},${_time}`)]);
    
    const batchListBytes = protobuf.BatchList.encode({
      batches: [batchToSend],
    }).finish();
    
    (async function () {
      if (batchListBytes == null) {
        try {
          var geturl = "http://localhost:8008/state/" + this.address; //endpoint used to retrieve data from an address in Sawtooth blockchain
          console.log("Getting from: " + geturl);
          let response = await fetch(geturl, {
            method: "GET",
          });
          let responseJson = await response.json();
          var data = responseJson.data;
          var newdata = Buffer.from(data, "base64").toString();
          return newdata;
        } catch (error) {
          console.error(error);
        }
      } 
    //   else if (_action === 'get') {
    //     try {
    //         var geturl = "http://localhost:8008/state"; //endpoint used to retrieve data from an address in Sawtooth blockchain
    //         console.log("Getting from: " + geturl);
    //         let response = await fetch(geturl, {
    //           method: "GET",
    //         });
    //         let responseJson = await response.json();
    //         var data = responseJson.data;
    //         console.log("data--", data);
    //         var newdata = Buffer.from(data, "base64").toString();
    //         console.log("newdata--", newdata);
    //         // return newdata;
    //       } catch (error) {
    //         console.error(error);
    //       }
    //   } 
      else {
        try {
          let resp = await fetch("http://localhost:8008/batches", {
            //endpoint to which we write data in a Sawtooth blockchain
            method: "POST",
            headers: { "Content-Type": "application/octet-stream" },
            body: batchListBytes,
          });
          console.log("response--", resp);
        } catch (error) {
          console.log("error in fetch", error);
        }
      }
    })();
    
}

//**** debug *** (ToRemove): *********************
app.get('/', (req, res) => {
	res.send("This Is Our Secure Server!")
});

app.post('/api/customer', (req, res) => {
    const id = req.body.package_id;
	if (id == null || id === undefined) {
        res.status(200).send({msg: 'Invalid package id', id: id}) // Internal Server Error
    } else {
          var geturl = "http://localhost:8008/state/" + _makeShippingAddress(id); //endpoint used to retrieve data from an address in Sawtooth blockchain
          console.log("Getting from: " + geturl);
          fetch(geturl, {
            method: "GET",
          }).then((response) => {
            response.json().then((responseJson) => {
              var data = responseJson.data;
              var newdata = Buffer.from(data, "base64").toString();
              res.status(200).send(state_to_object(newdata));
            });
          }).catch ((error) => {
            res.status(400).send({err: 'error'})
      } )
    }
})


app.post('/api/shipper', (req, res) => {
    const id = req.body.package_id;
    const location = req.body.location;
    const name = req.body.name;
    const time = req.body.time;
	if (id == null || id === undefined) {
        res.status(200).send({msg: 'Invalid package id'}) // Internal Server Error
    } else if (location == null || location === undefined) {
        res.status(200).send({msg: 'Invalid location'}) // Internal Server Error
    } else {
        block(id, 'update', location, name, time);
        res.status(200).send({msg: 'Success'}) // Internal Server Error
    }
})


app.post('/api/creator', (req, res) => {
    const id = req.body.package_id;
    const location = req.body.location;
    const name = req.body.name;
    const time = req.body.time;
    console.log('%%%%%%%%%%%%%%%',id,location,name)
	if (id == null || id === undefined) {
        res.status(200).send({msg: 'Invalid package id'}) // Internal Server Error
    } else if (location == null || location === undefined) {
        res.status(200).send({msg: 'Invalid location'}) // Internal Server Error
    } else {
        block(id, 'create', location, name, time);
        res.status(200).send({msg: 'Success'}) // Internal Server Error
    }
})

const state_to_object = (data) => {
  let packagesIterable = data
    .split("|")
    .map((x) => x.split(","))
    .map((x) => [
      x[0],
      { id: x[0], history: string_to_history(x[1]), location: x[2], name: x[3], time: x[4] },
    ]);


  return {result: packagesIterable};
};

const string_to_history = (string) => {
  let historyIterable = string
    .split("$")
    .map((x) => x.split("@"))
    .map((x) => {
      return { location: x[0], name: x[1], time: x[2] }
    });

  return historyIterable;
}
// ***********************************************

// --> general user requests: register/login

//Register:
app.post('/api/users', async (req, res) => { 
	// try {
	// 	const currentUser = users.find(user => user.name === req.body.name)
	// 	if(currentUser !== undefined){
	// 		res.status(209).send({msg: 'User Name Taken'})
	// 		return;
	// 	}
	// 	const hashedPassword = await bcrypt.hash(req.body.password, 10) // hash the user's password + salt
	// 	const user = { name: req.body.name, password: hashedPassword}
	// 	users.push(user) // add user to users list
	// 	data.push({name: user.name, passwords: []}) // add new empty entry for user to the data
	// 	console.log("regiter request:\n",user)
	// 	res.status(201).send({msg: 'Success'}) //OK - Created
	// } catch {
	//   	res.status(500).send({msg: 'Server Error'}) // Internal Server Error
	// }
});

//login: (only for first validation, sends current password file)
app.post('/api/users/login', async (req, res) => {
	// try {
	// 	const user = users.find(user => user.name === req.body.name)
	// 	if (user == undefined) {
	// 		  return res.status(209).send({msg: 'Cannot find user'})
	// 	}
	// 	if(await bcrypt.compare(req.body.password, user.password)) {
	// 		const userData = data.find((d)=>d.name === req.body.name)
	// 		console.log(user.name, " logged in successfully")
	// 		res.send({msg: 'Success', passwords: userData.passwords})
	// 	}
	// 	else {
	// 		res.send({msg: 'Not Allowed'})
	// 	}
	// } catch {
	//   res.status(500).send({msg: 'Server Error'})
	// }
});

//delete: delete all data from current user
app.delete('/api/users', async (req, res) => { 
	// try{
	// 	const valid = await validateUser(req.body.name, req.body.password)
	// 	if(!valid){
	// 		res.send({msg: 'Not Allowed'})
	// 		return;
	// 	}
	// 	users = users.filter((u)=> u.name !== req.body.name)
	// 	data = data.filter((d)=> d.name !== req.body.name)
	// 	console.log(req.body.name," deleted his user")
	// 	res.status(200).send({msg: 'Deleted'})
	// } catch {
	// 	res.status(500).send({msg: 'Server Error'})
  	// }
});

//specific user requests: add/edit credentials 

//update (replace) user's password file:
//--> req.body = {name, password, passwords}
//--> req.body.passwords = [ {domain, userName, userPassword }, ... ]
app.put('/api/data/', async (req, res) => {
	// try{
	// 	const valid = await validateUser(req.body.name, req.body.password)
	// 	if(!valid){
	// 		res.send({msg: 'Not Allowed'})
	// 		return;
	// 	}
	// 	const newData = req.body.passwords
	// 	let userData = data.find((d)=>d.name === req.body.name)
	// 	userData.passwords = newData // update current password file with the user's file
	// 	console.log('data recieved:\n', newData)
	// 	res.status(200).send({msg: 'Success'}) // OK
	// } catch {
	// 	res.status(500).send({msg: 'Server Error'})
	// }
});

//update/add to user's password file for a specific domain:
//--> req.body = {name, password, userName, userPassword}
app.put('/api/data/:domain', async (req, res) => {
	// try{
	// 	const valid = await validateUser(req.body.name, req.body.password)
	// 	if(!valid){
	// 		res.send({msg: 'Not Allowed'})
	// 		return;
	// 	}
	// 	let userData = data.find((d)=>d.name === req.body.name)
	// 	let index = userData.passwords.findIndex((e)=>e.domain === req.params.domain)
	// 	if(index === -1){
	// 		userData.passwords.push({domain: req.params.domain, userName: req.body.userName, userPassword: req.body.userPassword})
	// 	}
	// 	else userData.passwords[index] = {domain: req.params.domain, userName: req.body.userName, userPassword: req.body.userPassword}
	// 	console.log('data recieved:\n', {domain: req.params.domain, userName: req.body.userName, userPassword: req.body.userPassword})
	// 	res.status(200).send({msg: "Success"})
	// } catch {
	// 	res.status(500).send({msg: 'Server Error'})
	// }
});

app.listen(port, async() =>{
	// baseUrl = await ngrok.connect({
	// 	proto: 'http', // http|tcp|tls, defaults to http
	// 	addr: port, // port or network address, defaults to 80
	// 	region: 'eu', // one of ngrok regions (us, eu, au, ap), defaults to us
	// });
	// console.log("baseUrl for remote access:",baseUrl);
	// fs.writeFileSync('./BaseURL.json', JSON.stringify({baseUrl: baseUrl}, null, 2)); // write the new base url to file
	// console.log(`Listening on port ${port}... (Click Ctrl-C for server shutdown)`)
});