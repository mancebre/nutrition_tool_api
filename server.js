// BASE SETUP
// =============================================================================

//get current time
var now = new Date();

// call the packages we need
var express         = require('express');
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var app         	= express();
var cors            = require('cors');
var multer          = require('multer');


// configure app
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
//app.use(session({secret: 'keyboard cat'})); /* TODO change secret */
app.set('jwtTokenSecret', 'YOUR_SECRET_STRING');/* TODO change secret */

app.use(session({
    secret: 'cookie_secret',
    name: 'cookie_name',
    //store: sessionStore, // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(multer({
    // onFileUploadComplete: function (file) {
    //     console.log(file);
    // },
    dest: './uploads/',
    limits: {
        fieldNameSize: 100,
        files: 4,
        fileSize: 5000000
    }
}));

var port        = process.env.PORT || 8080; // set our port

//get server ip
var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family == 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

var host = addresses[0];
if (host != "104.131.17.237") {
    host = "localhost";
}

var mongoose = require('mongoose');
mongoose.connect('mongodb://'+host+'/helloself'); // connect to mongodb

// var IngredientsMapper = require('./app/models/ingredientsMapper');

var connection = require('./app/models/sr26Model');

require('./app/router')(app);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server started at: ' + now + '. Port: ' + port);

