var express = require("express");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
var router = express.Router();
/* GET index page. */
router.get("/", function(req, res) {
  let userData = {did: "", ID: ""};
  req.session.userData=userData;
  console.log(req.session);
  res.render("index", {data: ""});
});
router.get("/index", urlencodedParser,function(req, res) {
  if(req.session.hasOwnProperty('userData')){
    if(req.session.userData.ID!==""){
      console.log(req.cookies);
      res.render("index", {data: {ID: req.session.userData.ID}});
    }
    else res.redirect("/");
  }
  else res.redirect("/");
});

module.exports = router;