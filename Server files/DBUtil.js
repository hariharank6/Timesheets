var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

var adminObj = require("./Administrator.js");

var insertIntoDB = function (dataObj, collection, cbk) {
    if (dataObj != undefined && dataObj.ID != undefined) {
        var collection = collection ? collection : adminObj.data.db.userCollection;
        MongoClient.connect(adminObj.data.db.url, function (err, db) {
            if (err) throw err;
            var dbo = db.db(adminObj.data.db.name);
            dbo.collection(collection).insertOne(dataObj, function (err, result) {
                if (err) throw err;
                if (result) {
                    cbk(result);
                }
                console.log("1 document inserted");
                db.close();
            });
        });
    }
    else {
        this.doLog();
        console.log("Invalid data for insertion");
    }
};

var searchInDB = function (searchObj, collection, cbk) {
    if (searchObj != undefined) {
        var collection = collection ? collection : adminObj.data.db.userCollection;
        MongoClient.connect(adminObj.data.db.url, function (err, db) {
            if (err) throw err;
            var dbo = db.db(adminObj.data.db.name);
            dbo.collection(collection).find(searchObj).toArray(function (err, result) {
                if (err) throw err;
                if (result) {
                    cbk(result);
                }
                db.close();
            });
        });
    }
    else {
        this.doLog();
        console.log("Invalid DB search param");
    }
};

var updateInDB = function (oldObj, newObj, collection, cbk) {
    if (oldObj != undefined && newObj != undefined) {
        var collection = collection ? collection : adminObj.data.db.userCollection;
        MongoClient.connect(adminObj.data.db.url, function (err, db) {
            if (err) throw err;
            var dbo = db.db(adminObj.data.db.name);
            dbo.collection(collection).updateOne(oldObj, newObj, function (err, result) {
                if (err) throw err;
                if (result) {
                    cbk(result);
                }
                console.log("1 document updated");
                db.close();
            });
        });
    }
    else {
        this.doLog();
        console.log("Invalid data for insertion");
    }
};

exports.insertIntoDB = insertIntoDB;

exports.searchInDB = searchInDB;

exports.updateInDB = updateInDB;