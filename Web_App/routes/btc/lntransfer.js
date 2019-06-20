var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
const Eclair = require("config");
var fs = require("fs");
var checklogin = require("checklogin");
const bcrypt = require("bcrypt");
const csurf = require("csurf");
const csrfProtection = csurf();

router.get("/", csrfProtection, (req, res) => {	//Handle GET request to "/lntransfer"
	console.log(req.session);
	const a = checklogin.checklogin(req);
	if(!a)	res.redirect("/");
	else	res.render("btc/lntransfer",{data: {ID: req.session.userData.ID, csrfToken: req.csrfToken()}});
})
.post("/", urlencodedParser, csrfProtection, function(req, res){	//Handle POST request (send data) from "/lntransfer"
	if(!req.body) return res.sendStatus(400);	//Handle empty data
	else {
		const ln_req = req.body.ln_req;	//Input Lightning request
		const pass = req.body.pass;	//Input password
		Eclair.eclair.getinfo((err3,res3)=>{	//Make sure server is online
			if(err3){
				console.log("Server is currently offline");
				res.render("btc/lntransfer",{data: {ID: req.session.userData.ID, result: false, error: "Server is currently offline!", csrfToken: req.csrfToken()}});
			}
			else {
				const file = "./src/"+req.session.userData.ID+".json";
				const rr = fs.createReadStream(file);	//Read user information stored on JSON file
				var string ="";
				rr.on("data", (chunk) => {	//User information is readable and parsed into Object
					string = JSON.parse(chunk);
				});
				rr.on("end", () => {	//Ensure all user information is read
					if(string){	//Make sure user infor is not empty
						const flag = bcrypt.compareSync(pass,string.pass);
						if(!flag){	//Verify input password vs user actual password
							console.log("Wrong password!");
							res.render("btc/lntransfer",{data: {ID: req.session.userData.ID, result: false, error: "Wrong password!", csrfToken: req.csrfToken()}});
							rr.destroy();
						}
						else {
							Eclair.eclair.checkinvoice(ln_req, (err1, res1) => {	//Decode Lightning request
								if(err1){ //Invalid Lightning request
									console.log(err1.message);
									res.render("btc/lntransfer",{data: {ID: req.session.userData.ID, result: false, error: err1.message, csrfToken: req.csrfToken()}});
									rr.destroy();
								}
								else {
									const sat = res1.result.amount/1000;	//Convert request amount from Msat to sat
									if(sat>string.BTC.ln_Balance){	//Check user balance
										console.log("Insufficent Balance");
										res.render("btc/lntransfer",{data: {ID: req.session.userData.ID, result: false, error: "Insufficient Balance!", csrfToken: req.csrfToken()}});
										rr.destroy();
									}
									else {
										Eclair.eclair.send(ln_req,(async function(err2, res2){	//Make payment with the Lightning request
											if (err2){ //Server error
												console.error(err2.message);
												res.render("btc/lntransfer",{data: {ID: req.session.userData.ID, result: false, error: "Internal Server Error!", csrfToken: req.csrfToken()}});
												rr.destroy();
											}
											else {	
												if(res2.result.hasOwnProperty("failures")){
													console.log(res2);
													res.render("btc/lntransfer",{data: {ID: req.session.userData.ID, result: false, error: "Internal Server Error!", csrfToken: req.csrfToken()}});
													rr.destroy();
												}
												else {
													string.BTC.ln_Balance = string.BTC.ln_Balance/1 - sat;	//Update user balance
													const detail = {"type": "U2MEU", "currency": "ln_btc", "ln_req": ln_req, "to": res1.result.nodeId, "amount": sat, "desc": res1.result.description, "timeReq": res1.result.timestamp, "status": true, "hash": res1.result.paymentHash};
													string.sent.push(detail);
													const postdata = JSON.stringify(string, null, 2);
													fs.writeFileSync(file, postdata); //Update latest balance to JSON file
													console.log("Transfer successfully!");
													res.render("btc/lntransfer",{data: {ID: req.session.userData.ID, result: true, csrfToken: req.csrfToken()}});
													await sleep(1000);
													rr.destroy();							
												}
											}
										}));
									}
								}
							});}
					}
					else {
						console.log("Can't read file/File is empty");
						res.render("btc/lntransfer",{data: {ID: req.session.userData.ID, result: false, error: "Internal Server Error!", csrfToken: req.csrfToken()}});
						rr.destroy();
					}
				})
				.on("close", () => { //Close stream
					console.log("Stream is closed!");
				});
			}
		});
	}
});
function sleep(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms)
	})
}

module.exports = router;