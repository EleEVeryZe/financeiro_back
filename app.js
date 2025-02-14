var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
require('dotenv').config()
var indexRouter = require('./routes/index');
const morgan = require('morgan');
const logger = require("./config/winston");


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:" + JSON.stringify(err));
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:" + JSON.stringify(reason));
});

module.exports = app;
