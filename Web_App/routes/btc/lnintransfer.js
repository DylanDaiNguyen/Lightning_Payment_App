var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
var fs = require("fs");
var encryption = require("encrypt");
var checklogin = require("checklogin");
var bcrypt = require("bcrypt");
const csurf = require("csurf");
const csrfProtection = csurf();
router.get("/", csrfProtection, function(req, res){	//Handle GET request to "/lnintransfer"
	console.log(req.session);
	const a = checklogin.checklogin(req);
	if(!a)	res.redirect("/");
	else	res.render("btc/lnintransfer", {data: {ID: req.session.userData.ID, csrfToken: req.csrfToken()}});
})
.post("/", urlencodedParser, csrfProtection, function(req, res){	//Handle POST request (send data) from "/lnintransfer"
	if(!req.body) return res.sendStatus(400);	//Handle empty data
	else {
		const filename1 = "./src/"+req.session.userData.ID;
		const file1 = filename1+".json";
		const rr1 = fs.createReadStream(file1);	//Read user information stored on JSON file 1
		var string ="";
		rr1.on("data", (chunk1) => {	//User information is readable and parsed into Object
			string = JSON.parse(chunk1);
		});
		rr1.on("end", () => {	//Ensure all user information is read
			if(string){	//Make sure user infor is not empty
				const receive_ID = req.body.receive_ID;	//Input Recipient
				const pass = req.body.pass;	//Input password
				const sat = req.body.amount/1;	//Input Sat amount
				const desc = req.body.desc;
				const flag = bcrypt.compareSync(pass,string.pass);
				if(!flag){	//Verify input password vs user actual password
					res.render("btc/lnintransfer",{data: {ID: req.session.userData.ID, result: false, error: "Wrong password!", csrfToken: req.csrfToken()}});
					console.log("Wrong password!");
					rr1.destroy();
				}
				else {
					if(sat>string.BTC.ln_Balance){	//Check user balance
						res.render("btc/lnintransfer",{data: {ID: req.session.userData.ID, result: false, error: "Insufficient Balance!", csrfToken: req.csrfToken()}});
						console.log("Insufficient Balance!");
						rr1.destroy();
					}
					else {
						const file2 = "./src/"+receive_ID+".enc";
						fs.open(file2, "r", (err, fd) => {
							if(err){
								if(err.code === "ENOENT"){
									res.render("btc/lnintransfer",{data: {ID: req.session.userData.ID, result: false, error: "Wrong Recipient ID!", csrfToken: req.csrfToken()}});
									console.log("Wrong Recipient ID!");
									rr1.destroy();
									return;
								}
								res.render("btc/lnintransfer",{data: {ID: req.session.userData.ID, result: false, error: "Wrong Recipient ID!", csrfToken: req.csrfToken()}});
								console.log("Wrong Recipient ID!");
								rr1.destroy();
								throw err;
							}
							const pool = fs.readFileSync("./src/pool.json");
							const str = JSON.parse(pool);
							const now = new Date();
							const jsondate = now.toJSON();
							string.BTC.ln_Balance = string.BTC.ln_Balance/1 - sat;	//Update sender balance
							const sender = {"type": "Internal", "currency": "ln_btc", "to": receive_ID, "amount": sat, "desc": desc, "timesent": jsondate};
							const recipient = {"to": receive_ID, "detail": {"type": "Internal", "currency": "ln_btc", "from": req.session.userData.ID, "amount": sat, "desc": desc, "timereceived": jsondate}};
							string.sent.push(sender);
							str.pending.push(recipient);
							const postdata1 = JSON.stringify(string, null, 2);
							const postdata2 = JSON.stringify(str, null, 2);
							fs.writeFileSync("./src/pool.json", postdata2);
							console.log("Pool is updated");
							fs.writeFileSync(file1, postdata1);
							encryption.encrypt({filename: filename1, password: "Backintime123"});
							console.log("Sender information is updated");
							//Update latest balance to JSON file 
							res.render("btc/lnintransfer",{data: {ID: req.session.userData.ID, result: true, csrfToken: req.csrfToken()}});
							console.log("Transfer Success!");
						});
					}
				}
			}
			else {
				res.render("btc/lnintransfer",{data: {ID: req.session.userData.ID, result: false, error: "Internal Server Error! Try again later!", csrfToken: req.csrfToken()}});
				console.log("Can't read File 1 or File 1 is empty");
				rr1.destroy();
			}
		});
		rr1.on("close", () => { //Close stream 1
			console.log("Stream 1 is closed!");
		});
	}
});

module.exports = router;