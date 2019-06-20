var express = require('express');
var router = express.Router();
var checklogin = require('checklogin');
var bodyParser = require('body-parser')
var urlencodedParser = bodyParser.urlencoded({extended: true});
const message = require('uport-transports').message.util
var fs = require('fs');
const decodeJWT = require('did-jwt').decodeJWT
const transports = require('uport-transports').transport
const bcrypt = require('bcrypt');
const saltRounds = 10;
const myweb = require('../bin/www')
const credentials = require('config')
const csurf = require('csurf')
const csrfProtection = csurf()

import { Credentials } from 'uport-credentials'
const uport = new Credentials(credentials.credentials);
var filename = ''
var file =''
var ID =''
var pass =''

/* GET signup page. */
router.get('/', csrfProtection, function(req, res) {
	console.log(req.session);
	const a = checklogin.checklogin(req);
	if(a)	res.redirect('/logout');
	else{
		res.render('signup1', {data: {csrfToken: req.csrfToken()}});
	}
})
.post('/', urlencodedParser, csrfProtection, (req, res) => {
	if(!req.body){
		res.redirect('/')
		return res.sendStatus(400);
	} 
	else {
		ID = req.body.ID
		pass = req.body.pass
		filename = "./src/"+ID;
		file = filename+".json";
		const tempfile = filename+".enc"; //
		const exist = fs.existsSync(tempfile); //
		if(!exist){
			uport.createDisclosureRequest({
				requested: ['name'],
				notifications: true,
				callbackUrl: myweb.endpoint+'/signup/2'
			}, 60).then(requestToken => {
				console.log(decodeJWT(requestToken))  //log request token to console
				const uri = message.paramsToQueryString(message.messageToURI(requestToken), {callback_type: 'post'})
				console.log(uri)
				const qr =  transports.ui.getImageDataURI(uri)
				res.render('signup2',{data: {code: qr, csrfToken: req.csrfToken()}});
			})
		}
		else{
			console.log("Existing User ID");
			res.render('signup1', {data: {csrfToken: req.csrfToken(), error: "User ID is already exist!"}});
		}
	}
})
.post('/2', urlencodedParser, (req, res, next) => {
	if(!req.body) {
		res.redirect('/')
		return res.sendStatus(400);
	}
	else {	
		async function run(){
			var jwt = req.body.access_token;
			uport.authenticateDisclosureResponse(jwt).then( async(creds) => {
				const push = transports.push.send(creds.pushToken, creds.boxPub)
				uport.createVerification({
					sub: creds.did, // uport address of user

			//exp: <future timestamp>, // If your information is not permanent make sure to add an expires timestamp
					claim: {'Dylans App ID': {'Name': creds.name, 'ID' : ID}}
				}).then(async (attestation) => { // send attestation to user
					console.log(`Encoded JWT sent to user: ${attestation}`)
					console.log(`Decodeded JWT sent to user: ${JSON.stringify(decodeJWT(attestation))}`)
					return push(attestation)  // *push* the notification to the user's uPort mobile app.
				}).then(async (res1) => {
					console.log(res1)
					console.log('Push notification sent and should be recieved any moment...')
					console.log('Accept the push notification in the uPort mobile application')
					var hashpass =''
					bcrypt.hash(pass, saltRounds, function(err, hash) {
						if(err) console.error(err);
						hashpass = hash;
					});	 
					await sleep(500)
					const Obj = {
						"name": creds.name,
						"BTC": {
							"imported": {},
							"created": {},
							"ln_Balance": 0
						},
						"pass": hashpass,
						"sent": [],
						"received": []
					}
					await sleep(500)
					fs.writeFileSync(file,JSON.stringify(Obj, null, 2))
					console.log('Create successfully')
					
					/*var encrypt = require('encrypt');
					await sleep(500)
					encrypt.encrypt({filename: filename, password: "Backintime123"});
					await sleep(500)
					fs.unlinkSync(file);
					console.log('File deleted!'); */

					next();
				})
			}).catch( err => {
				console.log(err)
			})
		}
		function sleep(ms){
			return new Promise(resolve=>{
				setTimeout(resolve,ms)
			})
		}
		run();
	}
});

module.exports = router;