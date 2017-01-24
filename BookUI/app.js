var express = require('express');
var path = require('path');
var app = express();
var request = require('request');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var CloudFoundryStrategy = require('passport-predix-oauth').Strategy;
var OAuth2RefreshTokenStrategy = require('passport-oauth2-middleware').Strategy;
var session = require('express-session');
var expressProxy = require('express-http-proxy');
var proxyMiddleware = require('http-proxy-middleware');
var url = require('url');
var HttpsProxyAgent = require('https-proxy-agent');


/*******************************************************
INITIALIZE VARIABLES (LOCAL OR VCAP BASED ON ENV)
*******************************************************/

var CLIENT_ID;
var CALLBACK_URL;
var AUTHORIZATION_URL;
var TOKEN_URL;
var windServiceUrl;
var uaaUri;
var base64ClientCredential;
var cfStrategy;


var vcapsServices = JSON.parse(process.env.VCAP_SERVICES);
var uaaService = vcapsServices[process.env.uaa_service_label];


AUTHORIZATION_URL = uaaService[0].credentials.uri;
TOKEN_URL = uaaService[0].credentials.uri;



// read VCAP_APPLICATION
var vcapsApplication = JSON.parse(process.env.VCAP_APPLICATION);
CALLBACK_URL = 'https://'+vcapsApplication.uris[0]+"/login";

base64ClientCredential = process.env.base64ClientCredential;
CLIENT_ID = process.env.clientId;


/*********************************************************************
                PASSPORT PREDIX STRATEGY SETUP
**********************************************************************/
function configurePassportStrategy() {
    'use strict';
    var refreshStrategy = new OAuth2RefreshTokenStrategy({
        refreshWindow: 10, // Time in seconds to perform a token refresh before it expires
        userProperty: 'ticket', // Active user property name to store OAuth tokens
        authenticationURL: '/', // URL to redirect unathorized users to
        callbackParameter: 'login' //URL query parameter name to pass a return URL
    });
    passport.use('main', refreshStrategy); 
    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, the complete CloudFoundry profile is
    //   serialized and deserialized.
    passport.serializeUser(function(user, done) {
        // console.log("From USER-->"+JSON.stringify(user));
        done(null, user);
    });
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    function getSecretFromEncodedString(encoded) {
        if (!encoded) {
            return '';
        }
        var decoded = new Buffer(encoded, 'base64').toString();
        var values = decoded.split(':');
        if (values.length !== 2) {
            console.warn("WARNING! base64ClientCredential is not configured correctly. \n It should be the base64 encoded value of: 'client:secret' \n Set in localConfig.json for local dev, or environment variable in the cloud.");
            return "SecretNotSet";
        }
        return values[1];
    }

    cfStrategy = new CloudFoundryStrategy({
        clientID: CLIENT_ID,
        clientSecret: getSecretFromEncodedString(base64ClientCredential),
        callbackURL: CALLBACK_URL,
        authorizationURL: AUTHORIZATION_URL,
        tokenURL: TOKEN_URL
    },refreshStrategy.getOAuth2StrategyCallback() //Create a callback for OAuth2Strategy
    );

    passport.use(cfStrategy);
    //Register the OAuth strategy to perform OAuth2 refresh token workflow
    refreshStrategy.useOAuth2Strategy(cfStrategy);
}

if (CLIENT_ID && AUTHORIZATION_URL && base64ClientCredential) {
    configurePassportStrategy();
}

var app = express();

app.set('trust proxy', 1);
app.use(cookieParser('predixsample'));
// Initializing default session store
// *** this session store in only development use redis for prod **
app.use(session({
    secret: 'predixsample',
    name: 'cookie_name',
    proxy: true,
    resave: true,
    saveUninitialized: true}));

// Initialize Passport
app.use(passport.initialize());
// Also use passport.session() middleware, to support persistent login sessions (recommended).
app.use(passport.session());

//Initializing application modules
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));



app.get('/autherror', function(req, res){
    res.send("Unauthorized msg")
});

app.use('/',
    express.static(path.join(__dirname, '/'))
);

//callback route redirects to secure route after login
app.get('/login', passport.authenticate('predix', {
    failureRedirect: '/autherror'
  }), function(req, res) {
    res.redirect('/index.html');
});




app.get('/books', passport.authenticate('main', {
                        noredirect: false //Don't redirect a user to the authentication page, just show an error
                    }), function(req, res) {
	    request({'url':'https://bookservice.run.aws-usw02-pr.ice.predix.io/books'}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
    		res.send(body);    
    	}
    	else{
    		res.send(err);
    	}
    })
});



app.listen(process.env.VCAP_APP_PORT || 3000, function () {
	console.log ('Server started');
});