var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
const EclairClient = require("eclair-rpc");
var fs = require("fs");

/* GET users listing. */
router.get("/", function(req, res, next) {
    res.render("btc/lncreatenode",{data: req.session.userData.ID});
})
.post("/", urlencodedParser, function(req, res){
	if(!req.body) return res.sendStatus(400);
	else {
		var config = {
		protocol: "http",
		user: "daidepzai113",
		pass: "Backintime123",
		host: "127.0.0.1",
		port: "18332",
		};
		var rpc = new EclairClient(config); 		
		rpc.getinfo((err3,res3)=>{	//Make sure server is online
			if(err3)	console.log("Server is currently offline");
			else {
				var rr = fs.createReadStream("./src/daidepzai113.json");
				var str = "";
				rr.on("data", (chunk) => {
					str = JSON.parse(chunk);
				});
				rr.on("end", () => {
					if(str){
						const pass = req.body.pass;
						const fund = req.body.fund;
						var flag = bcrypt.compareSync(pass,str.pass);
						if(!flag){	//Verify input password vs user actual password
							rr.destroy();
							console.log("Wrong passphrase");
						}
						else {
						}
					}
				});
				rpc.open(nodeid, fund,(function(err, res){
				if (err) {
					console.error(err);
				}
				console.log(res);
				}));
			}
		});
	}
	res.render("btc/lncreatenode",{data: req.session.userData.ID});
});


module.exports = router;