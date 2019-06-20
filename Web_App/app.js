var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var sassMiddleware = require("node-sass-middleware");
var bodyParser = require("body-parser");
var session = require("express-session");
var indexRouter = require("./routes/index");
var lndecodeRouter = require("./routes/btc/lndecode");
var lntransferRouter = require("./routes/btc/lntransfer");
var lnreceiveRouter = require("./routes/btc/lnreceive");
var lnwithdrawRouter = require("./routes/btc/lnwithdraw");
var lnintransferRouter = require("./routes/btc/lnintransfer");
var loginRouter = require("./routes/login");
var merloginRouter = require("./routes/merlogin");
var home2Router = require("./routes/home2");
var home1Router = require("./routes/home1");
var homeRouter = require("./routes/home");
var sentRouter = require("./routes/sent");
var receivedRouter = require("./routes/received");
var signupRouter = require("./routes/signup");
var logoutRouter = require("./routes/logout");
var helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  onLimitReached: (req, res) => {
    res.redirect('/logout');
  }
  //skipSuccessfulRequests: true
});

var app = express();
//var urlencodedParser = bodyParser.urlencoded({extended: true});
//view engine setup
app.use(helmet({
  xssFilter: true,
  noCache: true,
  frameguard:{
    action: "deny"
  }
}));
//  apply limiter to all requests
//app.use(limiter);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({secret: "dylan", saveUninitialized: true, resave: true, cookie: {httpOnly: true, maxAge: 600000}}));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, "public"),
  dest: path.join(__dirname, "public"),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter)
.use("/btc/lndecode", lndecodeRouter)
.use("/btc/lntransfer", lntransferRouter)
.use("/btc/lnreceive", lnreceiveRouter)
.use("/btc/lnwithdraw", lnwithdrawRouter)
.use("/btc/lnintransfer", lnintransferRouter)
.use("/login", loginRouter)
.use("/merlogin", merloginRouter)
.use("/home", homeRouter)
.use("/home1", home1Router)
.use("/home2", home2Router)
.use("/sent", sentRouter)
.use("/received", receivedRouter)
.use("/signup", signupRouter)
.use("/logout", logoutRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//app.post('/addacc', checkAdd.validateForm());
//app.post('/checketh', checkEth.check());
module.exports = app;