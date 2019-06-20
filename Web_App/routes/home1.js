var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
var getData = require("getData");
const getPool = require("getPool");
//var decryption = require('decrypt');

/* GET home page. */
router.get("/", urlencodedParser, async function(req, res) {
	let userData = {did: "", ID: "luonganhtuan"};
	/*var filename = "./src/luonganhtuan";
	decryption.decrypt({filename: filename, password: "Backintime123"});
	await sleep(500);*/

	getPool.getPool("luonganhtuan");
	await sleep(500);
	var tempdata = getData.getData("luonganhtuan");
	tempdata.pass = "";
	const rawdata = tempdata;
	req.session.userData=userData;
	res.render("home", {data: rawdata, ID: "luonganhtuan"});
});
function sleep(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms);
	});
}
module.exports = router;