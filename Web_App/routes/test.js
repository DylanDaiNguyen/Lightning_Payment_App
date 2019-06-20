var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
const BitcoinClient = require("bitcoin-core");
var fs = require("fs");
var encrypt = require("encrypt");
var decrypt = require("decrypt");
var filename="./src/daidepzai113";
decrypt.decrypt({filename: filename, password: "Backintime123"});
//encrypt.encrypt({filename: filename, password: "Backintime123"});
const getPool = require("getPool");
//getPool.getPool("luonganhtuan");

