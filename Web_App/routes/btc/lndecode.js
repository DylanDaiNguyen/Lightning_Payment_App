var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
const Eclair = require("config");
var checklogin = require("checklogin");
const csurf = require("csurf");
const csrfProtection = csurf();

/* GET users listing. */
router.get("/", csrfProtection, function(req, res) {
	console.log(req.session);
	const a = checklogin.checklogin(req);
	if(!a)	res.redirect("/");
	else	res.render("btc/lndecode", {data: {ID: req.session.userData.ID, csrfToken: req.csrfToken()}});
});
router.post("/", urlencodedParser, csrfProtection, function(req, res){
	if(!req.body) return res.sendStatus(400);
	else { 
		Eclair.eclair.getinfo((err3,res3)=>{	//Make sure server is online
			if(err3){
				console.log("Server is currently offline");
				res.render("btc/lndecode", {data: {ID: req.session.userData.ID, result: false, error: "Server is currently offline", csrfToken: req.csrfToken()}});
			}
			else {
				const ln_req = req.body.ln_req;
				Eclair.eclair.checkinvoice(ln_req,(function(err, res1){
					if (err) {
						console.log(err.message);
						res.render("btc/lndecode", {data: {ID: req.session.userData.ID, result: false, error: err.message, csrfToken: req.csrfToken()}});
					}
					console.log(res1.result);
					const rawdata = res1.result;
					res.render("btc/lndecode",{data: {ID: req.session.userData.ID, result: true, info: rawdata, csrfToken: req.csrfToken()}});
				})); 
			}
		});
	}
});
module.exports = router;