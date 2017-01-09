var express = require('express')
var app = express()

app.get('/', function (req, res) {
  res.sendFile( __dirname +  "/index.html" );
})

app.listen(process.env.VCAP_APP_PORT || 3000, function () {
	console.log ('Server started');
});