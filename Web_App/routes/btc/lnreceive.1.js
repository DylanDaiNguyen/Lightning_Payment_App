var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
const Eclair = require("config");
var fs = require("fs");
var checklogin = require("checklogin");
var bcrypt = require("bcrypt");
var qrcode = require("qrcode");
const csurf = require("csurf");
const csrfProtection = csurf();

/* GET Create Lightning Request Page */
router.get("/", csrfProtection, function(req, res) {
	console.log(req.session);
	const a = checklogin.checklogin(req);
	if(!a)	res.redirect("/");
	else	res.render("btc/lnreceive", {data: {ID: req.session.userData.ID, csrfToken: req.csrfToken()}});
	/*req.session.userData = {did: '', ID: 'daidepzai113'}
	res.render('btc/lnreceive', {data: {ID: req.session.userData.ID}});*/
})
.post("/", urlencodedParser, csrfProtection, (req, res) => {
	var ln_req = "";
	var myurl = "";
	if(!req.body) return res.sendStatus(400);
	else {
		Eclair.eclair.getinfo((err3,res3)=>{	//Make sure server is online
			if(err3){
				console.log("Server is currently offline");
				res.render("btc/lnreceive",{data: {ID: req.session.userData.ID, result: false, error: "Server is currently offline!", csrfToken: req.csrfToken()}});
			}
			else {
				const file = "./src/"+req.session.userData.ID+".json";
				const rr = fs.createReadStream(file);
				var str = "";
				rr.on("data", (chunk) => {
					str = JSON.parse(chunk);
				});
				rr.on("end", () => {
					if(str){
						const sat = req.body.amount/1;
						const desc = req.body.desc;
						const pass = req.body.pass;
						const flag = bcrypt.compareSync(pass, str.pass);
						if(!flag){	//Verify input password vs user actual password
							console.log("Wrong passphrase");
							res.render("btc/lnreceive",{data: {ID: req.session.userData.ID, result: false, error: "Wrong passphrase!", csrfToken: req.csrfToken()}});
							rr.destroy();
						}
						else {
							const msat = sat*1000;
							Eclair.eclair.receive(msat, desc,(function(err, res1){
								if (err) {
									console.log(err.message);
									res.render("btc/lnreceive",{data: {ID: req.session.userData.ID, result: false, error: err.message, csrfToken: req.csrfToken()}});
									rr.destroy();
								}
								ln_req = res1.result;
								qrcode.toDataURL(ln_req, async (err1, qr) => {
									if(err1){	
										console.log(err1);
										res.render("btc/lnreceive",{data: {ID: req.session.userData.ID, result: false, error: err1, csrfToken: req.csrfToken()}});
									}
									myurl = qr;
									console.log(ln_req);
									res.render("btc/lnreceive",{data: {ID: req.session.userData.ID, result: true, req: ln_req, url: myurl, csrfToken: req.csrfToken()}});
								});
								rr.destroy();
							}));
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

module.exports = router;