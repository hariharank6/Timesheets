var express = require('express');
var app = express();

var bodyParser = require('body-parser')

var path = require('path');

var adminObj = require("./Administrator.js");

app.use(express.static(path.join(__dirname, '../randomDirectory')));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.all("/*", adminObj.requestHandler);

var server = app.listen(8080, adminObj.serverStartCbk);