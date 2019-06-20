var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({extended: true});
var cookieParser = require('cookie-parser');
const transports = require('uport-transports').transport
const message = require('uport-transports').message.util
var decryption = require('decrypt');
var myweb = require('../bin/www')
const credentials = require('config')
router.use(cookieParser());
let userData = {did: "", ID: ""};
let myclaim = 'Dylans App ID'
let firstsessID = ''
import { Credentials } from 'uport-credentials'
var uport = new Credentials(credentials.credentials)
/* GET customer login page */
router.get('/', function(req, res) {
	firstsessID = req.sessionID
	
	uport.createDisclosureRequest({
		verified: [myclaim],
		notifications: true,
		callbackUrl: myweb.endpoint+'/login'	
	}, 60).then(requestToken => {
		const uri = message.paramsToQueryString(message.messageToURI(requestToken), {callback_type: 'post'})
    	const qr =  transports.ui.getImageDataURI(uri)
		res.render('login',{data: qr});
	})	
})
.post('/', urlencodedParser, (req, res) => {
	if(!req.body) {
		res.redirect('/')
		return res.sendStatus(400);
	}
	else {
		async function run(){
			var jwt = req.body.access_token
			uport.verifyDisclosure(jwt).then(creds => {
				if(!creds.verified.hasOwnProperty([0]))	{ 
					console.log("no verified")
					res.redirect('/')
					return false
				}
				userData.did = creds.did
				userData.ID = creds.verified[0].claim[myclaim].ID
				console.log('logged in')
			}).catch( err => {
			console.log(err)
			})
			await sleep(20000)
			if(userData.ID){
				var filename = "./src/"+userData.ID
				console.log(filename)
				await sleep(500)
				decryption.decrypt({filename: filename, password: "Backintime123"})
				var temp = JSON.parse(req.sessionStore.sessions[firstsessID])
				temp.userData = userData
				req.sessionStore.sessions[firstsessID] = JSON.stringify(temp)
				console.log(req.sessionStore)
			}else	console.log("fail")
		}
		run()
	}
});

function sleep(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms)
	})
}
module.exports = router