var express = require("express");
var router = express.Router();
//const encrypt = require("encrypt");
//const fs = require("fs");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});

/* Logout. */
router.get("/", urlencodedParser, async function(req, res, next) {
  /*const filename="./src/"+req.session.userData.ID;
  const file = filename+".json";
  encrypt.encrypt({filename: filename, password: "Backintime123"});
  await sleep(500);
  fs.unlink(file,(err)=>{
    if(err) console.error(err);
  });
  console.log("JSON file deleted!");*/

  // delete session object
  req.session.destroy(function(err) {
    if(err) {
      return next(err);
    } else {
      res.clearCookie("userData");
      console.log("Session cleared!");
      return res.redirect("/");
    }
  });
});
/*function sleep(ms){
	return new Promise(resolve=>{
		setTimeout(resolve,ms);
	});
}*/
module.exports = router;