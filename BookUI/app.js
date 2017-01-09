var express = require('express');
var path = require('path');
var app = express();
var request = require('request');



app.get('/', function (req, res) {
  res.sendFile( __dirname +  "/index.html" );
})



app.use('/', express.static(path.join(__dirname, '/')))

app.get('/books', function (req, res) {

	request({'url':'https://bookservice.run.aws-usw02-pr.ice.predix.io/books',
        'proxy':'http://sjc1intproxy01.crd.ge.com:8080'}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
    		res.send(body);    
    	}
	})
	
})


app.listen(process.env.VCAP_APP_PORT || 3000, function () {
	console.log ('Server started');
});