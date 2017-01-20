var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

var routerV0 = require('./routes/v0/router');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
var router = express.Router();

app.get('/', function(req,res){  
    res.redirect('http://testpoint.io/json')
});

app.use('/api/v0/', routerV0);



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(cookieParser());


app.use(express.static(__dirname + '/resources'));
app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    var status = err.status || 500;
    res.status(status);
    var errors = {"Errors": [{"Error": {"code": status, "title": err.message}}]};
    res.end(JSON.stringify(errors));
    /*res.render('error');*/
});


module.exports = app;
