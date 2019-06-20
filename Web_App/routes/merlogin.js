var express = require("express");
var router = express.Router();

/* GET merchant login page. */
router.get("/", function(req, res) {
  res.render("merlogin");
});

module.exports = router;