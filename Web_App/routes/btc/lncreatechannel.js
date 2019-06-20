var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
const EclairClient = require("eclair-rpc");

/* GET users listing. */
router.get("/", function(req, res, next) {
    res.render("btc/lncreatechannel",{data: req.session.userData.ID});
})
.post("/", urlencodedParser, function(req, res){
  console.log(req.body);
	if(!req.body) return res.sendStatus(400);
	else {
		const pass = req.body.pass;
		const fund = req.body.fund;
		const nodeid = "029761b05091cb2b6742515a371fcd95fcfb9b25df7602e51a03214acdfbc9f8cd";
		var config = {
		protocol: "http",
		user: "daidepzai113",
		pass: pass,
		host: "127.0.0.1",
		port: "8086",
		};
		var rpc = new EclairClient(config); 		
		//res.set('Content-Type', 'text/plain');
		//res.send('You sent: ${ln_req} to Express');
		function sleep(ms){
			return new Promise(resolve=>{
				setTimeout(resolve,ms);
			});
		}
		function createChannel() {
			rpc.connect(nodeid, "127.0.0.1", 48001, (err, res) =>{
				if (err) { 
					console.error(err);
					console.log(res);
				}
				else {
					console.log(res);
					sleep(5000).then(rpc.open(nodeid, fund, ((err1, res1)=>{
						if (err1) {
							console.error(err1);
						}
						console.log(res1);
					})));
				}
			});
		}
		createChannel();
	}
	res.render("btc/lncreatechannel",{data: req.session.userData.ID});
});

module.exports = router;