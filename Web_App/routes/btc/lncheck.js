var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
const EclairClient = require("eclair-rpc");
var checklogin = require("checklogin");

/* GET users listing. */
router.get("/", function(req, res, next) {
	console.log(req.session);
	var a = checklogin.checklogin(req);
	if(!a)	res.redirect("/");
	else	res.render("btc/lncheck",{data: req.session.userData.ID});
})
.post("/", urlencodedParser, (req, res) =>{
	if(!req.body) return res.sendStatus(400);
	else {
		const ln_req = req.body.ln_req;
		var config = {
		protocol: "http",
		user: "daidepzai113",
		pass: "1",
		host: "127.0.0.1",
		port: "8080",
		};
		var rpc = new EclairClient(config); 		
		function check() {
			rpc.checkinvoice(ln_req,(function(err, res){
				if (err) {
					console.log(err.message);
				}
				console.log(res);
			}));
		}
		check();
	}
	res.render("btc/lncheck",{data: req.session.userData.ID});
});

module.exports = router;