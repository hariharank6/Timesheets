var express = require('express');
var https = require('https');
var app = express();

var bodyParser = require('body-parser');

var path = require('path');

var adminObj = require("./Administrator.js");

var fs = require('fs');

app.use(express.static(path.join(__dirname, '../randomDirectory')));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.all("/*", adminObj.requestHandler);

var options = {
    ca: fs.readFileSync(adminObj.data.url.certificatesFilePath + 'server.csr'),
    cert: fs.readFileSync(adminObj.data.url.certificatesFilePath + 'server.cert'),
    key: fs.readFileSync(adminObj.data.url.certificatesFilePath + 'server.key')
};
var server = https.createServer(options, app);

server.listen(8080, adminObj.serverStartCbk);