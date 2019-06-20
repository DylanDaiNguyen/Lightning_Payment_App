var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
var checklogin = require("checklogin");
var getData = require("getData");
const getPool = require("getPool");

/* GET sent invoices page. */
router.get("/", urlencodedParser, async function(req, res) {
	const a = checklogin.checklogin(req);
	if(!a)	res.redirect("/");
	else	{
		getPool.getPool(req.session.userData.ID);
		await sleep(500);
		var tempdata = getData.getData(req.session.userData.ID);
		tempdata.pass = "";
		const rawdata = tempdata;
		res.render("sent", {data: rawdata, ID: req.session.userData.ID});
	}
});
function sleep(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms);
	});
}
module.exports = router;