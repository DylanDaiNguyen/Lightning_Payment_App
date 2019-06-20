var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
var fs = require("fs");
var checklogin = require("checklogin");
var bcrypt = require("bcrypt");
const Bitcoind = require("config");
const csurf = require("csurf");
const csrfProtection = csurf();

/* GET BTC Withdraw Page. */
router.get("/", csrfProtection, function(req, res) {
	console.log(req.session);
	const a = checklogin.checklogin(req);
	if(!a)	res.redirect("/");
	else	res.render("btc/lnwithdraw",{data: {ID: req.session.userData.ID, csrfToken: req.csrfToken()}});
})
.post("/", urlencodedParser, csrfProtection, (req, res) => {
	console.log(req.body);
	if(!req.body) return res.sendStatus(400);
	else { 
		Bitcoind.bitcoind.getBalance((err1, res1) => {
			if(err1){
				console.error(err1);
				res.render("btc/lnwithdraw",{data: {ID: req.session.userData.ID, result:false, error: "Server is currently offline!", csrfToken: req.csrfToken()}});
			}
			else{
				const sat = req.body.amount/1;
				const btc_add = req.body.btc_add;
				const pass = req.body.pass;
				const file = "./src/"+req.session.userData.ID+".json";
				const rr = fs.createReadStream(file);
				var str = "";
				rr.on("data", (chunk) => {
					str = JSON.parse(chunk);
				});
				rr.on("end", () => {
					if(str){
						const flag = bcrypt.compareSync(pass,str.pass);
						if(!flag){	//Verify input password vs user actual password
							console.log("Wrong passphrase");
							res.render("btc/lnwithdraw",{data: {ID: req.session.userData.ID, result: false, error: "Wrong Passphrase!", csrfToken: req.csrfToken()}});
							rr.destroy();
						}
						else {
							if(str.BTC.ln_Balance<sat){
								console.log("Insufficent Balance");
								res.render("btc/lnwithdraw",{data: {ID: req.session.userData.ID, result: false, error: "Insufficient Balance!", csrfToken: req.csrfToken()}});
								rr.destroy();
							}
							else {
								const val = sat/100000000;
								Bitcoind.bitcoind.sendToAddress(btc_add, val,"","",true,(async function(err, res2){
									if (err) {
										console.error(err.message);
										res.render("btc/lnwithdraw",{data: {ID: req.session.userData.ID, result: false, error: err.message, csrfToken: req.csrfToken()}});
										rr.destroy();
									}
									else {
										console.log(res2);
										str.BTC.ln_Balance = str.BTC.ln_Balance - sat;
										const detail = {"type": "Withdraw", "currency": "ln_btc", "to": btc_add, "amount": sat, "status": true, "hash": res2};
										str.sent.push(detail);
										const postdata = JSON.stringify(str, null, 2);
										fs.writeFileSync(file,postdata);
										console.log("Withdraw successfully");
										res.render("btc/lnwithdraw",{data: {ID: req.session.userData.ID, result: true, csrfToken: req.csrfToken()}});
										await sleep(1000);
										rr.destroy();
									}
								}));
							}
						}
					}
				});
				rr.on("close", () => {
					console.log("Stream closed");
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