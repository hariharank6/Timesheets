var express = require('express');
var app = express();

var bodyParser = require('body-parser')

var path = require('path');

var url = require('url');

var fs = require('fs');

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

const {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var globalOAuth2Client = "";

var drive = google.drive('v3');
var sheets = google.sheets('v4');

const jsdom = require("jsdom");
const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
var $ = require("jquery")(dom.window);

var randomString = require("randomstring");

var moment = require('moment');

var thisObj = {
    url: {
        host: "http://192.168.233.80.xip.io:8080",
        indexPage: "/index.html",
        authenticatePage: "/authenticate.html",
        preferencesPage: "/preferences.html",
        analysisPage: "/analysis.html",
        autoAuthenticateCall: "/autoAuthenticate",
        updatePreferencesCall: "/updatePreference",
        refreshDepartmentsCall: "/refreshDepartments",
        credentialsFilePath: "Server files/credentials.json",
        accessToken: "https://www.googleapis.com/oauth2/v4/token"
    },
    db: {
        url: "mongodb://localhost:27017/mydb",
        name: "TS",
        userCollection: "Users",
        availableDepartmentsID: "availableDepartments",
        departmentsCollection: "Departments",
        driveFilesCollection: "GoogleDrive",
        driveFilesID: "driveFiles"
    },
    credentials : {
        clientID: "",
        clientSecret: "",
        redirectURI: "",
        adminRefreshToken: "1/XdYezw7jy5m6RDgarSfP5qKZNTw1CW2Dt_razqHAups"
    },
    availableDepartments: [],
    driveFiles: {
        startDate: "",
        endDate: "",
        isUpdated: false,
        files: {}
    },
    doLog: function () {

    },
    getOAuthClient: function () {
        if(thisObj.credentials.clientID == "" && thisObj.credentials.clientSecret == "" && thisObj.credentials.redirectURI == "") {
            var credentialsFileData = fs.readFileSync(thisObj.url.credentialsFilePath, "utf8");
            credentialsFileData = credentialsFileData ? JSON.parse(credentialsFileData) : {};
            if (credentialsFileData.web && credentialsFileData.web.client_id && credentialsFileData.web.client_secret && credentialsFileData.web.redirect_uris[0]) {
                thisObj.credentials.clientID = credentialsFileData.web.client_id;
                thisObj.credentials.clientSecret = credentialsFileData.web.client_secret;
                thisObj.credentials.redirectURI = credentialsFileData.web.redirect_uris[0];           
            }
            else {
                thisObj.doLog("ERROR: can't read Credentials file");
            }
        }      
        if (thisObj.credentials.clientID && thisObj.credentials.clientSecret && thisObj.credentials.redirectURI) {
            oauth2Client = new OAuth2(thisObj.credentials.clientID, thisObj.credentials.clientSecret, thisObj.credentials.redirectURI);
            return oauth2Client;
        }
        else {
            thisObj.doLog("ERROR: can't read Credentials file");
        }
    },
    getAuthURL: function () {
        var scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/spreadsheets'
        ];
        var authUrl = globalOAuth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes,
            state: 'foo'
        });
        console.log(authUrl);
        return authUrl;
    },
    getTokenizedOAuth2Client: function (refreshToken) {
        if (refreshToken) {
            var oauth2Client = thisObj.getOAuthClient();
            var config = {};
            config.url = thisObj.url.accessToken;
            config.type = "POST";
            config.async = false;
            config.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
            config.data = {
                "client_id": thisObj.credentials.clientID,
                "client_secret": thisObj.credentials.clientSecret,
                "refresh_token": refreshToken,
                "grant_type": "refresh_token"
            };
            config.complete = function (data) {
                data = data ? data.responseJSON : "";
                if (data && data.access_token) {
                    oauth2Client.setCredentials({
                        access_token: data.access_token
                    });                    
                }
                else {
                    thisObj.doLog("Invalid Refresh Token");
                }
            }
            $.ajax(config);
            return oauth2Client;
        }
    },
    insertIntoDB: function (dataObj, collection, cbk) {
        if (dataObj != undefined && dataObj.ID != undefined) {
            var collection = collection ? collection : thisObj.db.userCollection;
            MongoClient.connect(thisObj.db.url, function (err, db) {
                if (err) throw err;
                var dbo = db.db(thisObj.db.name);
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
    },
    searchInDB: function (searchObj, collection, cbk) {
        if (searchObj != undefined) {
            var collection = collection ? collection : thisObj.db.userCollection;
            MongoClient.connect(thisObj.db.url, function (err, db) {
                if (err) throw err;
                var dbo = db.db(thisObj.db.name);
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
    },
    updateInDB: function (oldObj, newObj, collection, cbk) {
        if (oldObj != undefined && newObj != undefined) {
            var collection = collection ? collection : thisObj.db.userCollection;
            MongoClient.connect(thisObj.db.url, function (err, db) {
                if (err) throw err;
                var dbo = db.db(thisObj.db.name);
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
    },
    syncDepartmentsList: function (departmentDetails) {
        if (departmentDetails && departmentDetails.length > 0) {
            var oldObj = {
                "ID": thisObj.db.availableDepartmentsID
            }
            var newObj = {
                $set: { "departments": departmentDetails }
            }
            var updateCbk = function(updateObj) {
                if (updateObj && updateObj.length > 0) {
                    thisObj.availableDepartments = departmentDetails;
                    console.log("Available departments synced");
                }
                else {
                    thisObj.doLog();
                }
            }
            thisObj.updateInDB(oldObj, newObj, thisObj.db.departmentsCollection, updateCbk);
        }
        else {
            var searchObj = {
                "ID": thisObj.db.availableDepartmentsID
            }
            var searchCbk = function(availableDepartmentsObj) {
                if (availableDepartmentsObj && availableDepartmentsObj[0] && availableDepartmentsObj[0].departments) {
                    thisObj.availableDepartments = availableDepartmentsObj[0].departments;
                    console.log("Fetched available departments");
                }
                else {
                    thisObj.availableDepartments = [];
                    thisObj.doLog();
                }
            }
            thisObj.searchInDB(searchObj, thisObj.db.departmentsCollection, searchCbk);
        }
    },
    checkID: function (ID, callLocation, cbk) {
        ID = (ID == undefined) ? "" : ID;
        var status;
        var checkStatus = {
            authentication: {
                ID: "",
                name: "",
                status: "",
                message: "",
                picture: ""
            },
            searchResult: {}
        }
        if (ID == "") {
            if (callLocation && callLocation.path == thisObj.url.authenticatePage) {
                checkStatus.authentication.status = "IN_PROGRESS";
                checkStatus.authentication.message = "Authorization is in progess";
            }
            else {
                checkStatus.authentication.status = "NEW_USER";
                checkStatus.authentication.message = "Authorize app to get started";
            }
            if(cbk) {
                cbk(checkStatus);
            }
        }
        else {
            var searchCbk = function(searchResult) {
                checkStatus.searchResult = searchResult;
                if (checkStatus.searchResult && checkStatus.searchResult[0] && checkStatus.searchResult[0].ID) {
                    if (callLocation && callLocation.path == thisObj.url.authenticatePage) {
                        checkStatus.authentication.status = "SKIPPED";
                        checkStatus.authentication.message = "Authorization skipped";
                        checkStatus.authentication.ID = ID;
                        checkStatus.authentication.name = checkStatus.searchResult[0].auth.name;
                        checkStatus.authentication.picture = checkStatus.searchResult[0].auth.picture;
                    }
                    else {
                        checkStatus.authentication.status = "SUCCESS";
                        checkStatus.authentication.message = "Authorization success";
                        checkStatus.authentication.ID = ID;
                        checkStatus.authentication.name = checkStatus.searchResult[0].auth.name;
                        checkStatus.authentication.picture = checkStatus.searchResult[0].auth.picture;
                    }
                }
                else {
                    checkStatus.authentication.status = "FAILURE";
                    checkStatus.authentication.message = "Authorization failed";
                }
                if(cbk) {
                    cbk(checkStatus);
                }
            }
            thisObj.searchInDB({ "ID": ID }, "",searchCbk);
        }
    },
    requestHandler: function (request, response) {
        var requestUrl = url.parse(request.url, true);
        var pathName = requestUrl.pathname;
        switch (pathName) {
            case thisObj.url.autoAuthenticateCall: {
                thisObj.autoAuthenticateCallHandler(request, response);
                break;
            }
            case thisObj.url.updatePreferencesCall: {
                thisObj.updatePreferencesCallHandler(request, response);
                break;
            }
            default: {
                response.redirect(thisObj.url.host + thisObj.url.indexPage);
                break;
            }
        }
    },
    getIndexPageData: function (searchResult, responseData) {
        console.log("Index page");
        thisObj.syncGDriveFileID();
        if (searchResult && searchResult[0].preferences && searchResult[0].preferences.department && searchResult[0].preferences.startDate && searchResult[0].preferences.endDate) {
            var links = [
                {
                    "name": "Preferences",
                    "url": thisObj.url.host + thisObj.url.preferencesPage
                },
                {
                    "name": "Results",
                    "url": thisObj.url.host + thisObj.url.analysisPage
                }
            ];
        }
        else {
            var links = [
                {
                    "name": "Preferences",
                    "url": thisObj.url.host + thisObj.url.preferencesPage
                }
            ];
        }
        responseData.data.links = links;
        responseData.data.preferences = searchResult[0].preferences;
        return responseData;
    },
    getAuthenticatePageData: function (searchResult, authCode, responseData, cbk) {
        console.log("Autheticate page");    //
        if (authCode && authCode != "accessDenied") {
            var persistentObj = {
                tokenGenerator: function (err, token) {
                    if (err) {
                        console.log('Error while trying to retrieve access token', err);
                    }
                    else {
                        persistentObj.idToken = token.id_token;
                        if (token.refresh_token) {
                            persistentObj.refreshToken = token.refresh_token;
                        }
                        var config = {};
                        config.url = "https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + token.access_token;
                        config.type = "GET";
                        config.complete = function (userInfo) {
                            userInfo = userInfo != undefined ? userInfo.responseJSON : {};
                            if(userInfo && userInfo.hd && userInfo.hd == "skava.com") {
                                email = userInfo.email;
                                var searchCbk = function(userDetail) {
                                    if (userDetail && userDetail[0] && userDetail[0].ID) {
                                        // returning user
                                        var tempCbk = function() {
                                            persistentObj.responseData.authentication.ID = userDetail[0].ID;
                                            persistentObj.responseData.authentication.name = userDetail[0].auth.name;
                                            persistentObj.responseData.authentication.picture = userDetail[0].auth.picture;
            
                                            if (userDetail && userDetail[0] && userDetail[0].preferences && userDetail[0].preferences.department) {
                                                persistentObj.responseData.data.redirectURL = thisObj.url.host + thisObj.url.indexPage;
                                            }
                                            else {
                                                persistentObj.responseData.data.redirectURL = thisObj.url.host + thisObj.url.preferencesPage;
                                            }
                                            if (persistentObj.cbk) {
                                                persistentObj.cbk(persistentObj.responseData);
                                            }
                                        }
                                        if (persistentObj.refreshToken) {
                                            var oldObj = {
                                                "email": email
                                            };
                                            var newObj = {
                                                $set: {
                                                    "auth.name": userInfo.name,
                                                    "auth.idToken": persistentObj.idToken,
                                                    "auth.picture": userInfo.picture,
                                                    "auth.refreshToken": persistentObj.refreshToken
                                                }
                                            };
                                            thisObj.updateInDB(oldObj, newObj, "", tempCbk);
                                        }
                                        else {
                                            if(tempCbk) {
                                                tempCbk();
                                            }
                                        }
                                    }
                                    else {
                                        // new user
                                        var newID = randomString.generate(66);  //
                                        var DBentry = {
                                            ID: newID,
                                            preferences: {
                                                department: "",
                                                users: []
                                            },
                                            email: userInfo.email,
                                            auth: {
                                                refreshToken: persistentObj.refreshToken,
                                                picture: userInfo.picture,
                                                name: userInfo.name,
                                                idToken: persistentObj.idToken
                                            }
                                        };
                                        var insertCbk = function(insertResult) {
                                            if (insertResult && insertResult.insertedCount) {
                                                persistentObj.responseData.authentication.ID = newID;
                                                persistentObj.responseData.authentication.name = userInfo.name;
                                                persistentObj.responseData.data.redirectURL = thisObj.url.host + thisObj.url.preferencesPage;
                                            }
                                            else {
                                                thisObj.doLog();
                                            }
                                            if (persistentObj.cbk) {
                                                persistentObj.cbk(persistentObj.responseData);
                                            }
                                        }
                                        thisObj.insertIntoDB(DBentry, "", insertCbk);
                                    }
                                }
                                thisObj.searchInDB({ "email": email }, "", searchCbk);
                            }
                            else {
                                persistentObj.responseData.data.redirectURL = thisObj.url.host + thisObj.url.indexPage;
                                persistentObj.responseData.message = "Please provide access to a skava Id to proceed";
                                if (persistentObj.cbk) {
                                    persistentObj.cbk(persistentObj.responseData);
                                }
                            }
                        }
                        config.error = function (data) {
                            console.log("User info verification failed");
                        }
                        $.ajax(config);
                    }
                },
                responseData: responseData,
                cbk: cbk,
                refreshToken: "",
                idToken: ""
            }
            globalOAuth2Client.getToken(authCode, persistentObj.tokenGenerator);
        }
        else {
            thisObj.doLog("authCode failure");
            responseData.data.redirectURL = thisObj.url.host + thisObj.url.indexPage;
            responseData.message = "Please authorize the app to get started";
            cbk(responseData);
        }
    },
    getPreferencesPageData: function (searchResult, responseData) {
        console.log("Preferences page");
        if (searchResult != undefined && searchResult[0] && searchResult[0].preferences != undefined) {
            if (searchResult[0].preferences.department) {
                responseData.data.preferences.department = searchResult[0].preferences.department;
            }
            if (searchResult[0].preferences.users) {
                responseData.data.preferences.users = searchResult[0].preferences.users;
            }
            if (searchResult[0].preferences.startDate) {
                responseData.data.preferences.startDate = searchResult[0].preferences.startDate;
            }  
            if (searchResult[0].preferences.endDate) {
                responseData.data.preferences.endDate = searchResult[0].preferences.endDate;
            }       
        }
        responseData.data.preferences.availableDepartments = thisObj.availableDepartments;
        responseData.data.preferences.minDate = thisObj.driveFiles.startDate._i;
        responseData.data.preferences.maxDate = thisObj.driveFiles.endDate._i;
        return responseData;
    },
    getAnalysisPageData: function (searchResult, responseData, cbk) {
        console.log("Analysis page");
        if (searchResult && searchResult[0].auth && searchResult[0].auth.refreshToken) {
            var oauth2Client = thisObj.getTokenizedOAuth2Client(searchResult[0].auth.refreshToken);
            if (searchResult[0].preferences && searchResult[0].preferences.department && searchResult[0].preferences.startDate && searchResult[0].preferences.endDate && searchResult[0].preferences.users.length) {
                var startDate = moment(searchResult[0].preferences.startDate, "MM_DD_YYYY");
                var endDate = moment(searchResult[0].preferences.endDate, "MM_DD_YYYY");
                var users = searchResult[0].preferences.users;
                google.options({ auth: oauth2Client });
                var persistentObj = {
                    sheetOptions: {
                        spreadsheetId: '1MDZ6TvX0kCZnFAYpAoNKLnLJUWfE2ARFkXLkdVJpwd8',
                        majorDimension: 'COLUMNS',
                        ranges: ['C6:C', 'DB6:DB'],
                        valueRenderOption: 'UNFORMATTED_VALUE'
                    },
                    dataGenerator: function (error, result) {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            var userNames = result.data.valueRanges[0].values[0];
                            var userResponse = result.data.valueRanges[1].values[0];
                            var sheetData = {
                                spreadsheetId: result.data.spreadsheetId,
                                userData: {}
                            };
                            for (var i = 0; i < userNames.length; i++) {
                                if (userResponse[i] == undefined || userResponse[i] == "" || userResponse[i] < 0.3333333333333333) {
                                    sheetData.userData[userNames[i]] = false;
                                }
                                else {
                                    sheetData.userData[userNames[i]] = true;
                                }
                            }
                            var date = "";
                            for (keys in thisObj.driveFiles.files) {
                                for (subkeys in thisObj.driveFiles.files[keys]) {
                                    if (thisObj.driveFiles.files[keys][subkeys] == sheetData.spreadsheetId) {
                                        persistentObj.responseData.data.results[keys] = [];
                                        date = keys;
                                        break;
                                    }
                                }
                                if (date != "") {
                                    break;
                                }
                            }
                            for (i = 0; i < persistentObj.searchResult[0].preferences.users.length; i++) {
                                if (sheetData.userData[persistentObj.searchResult[0].preferences.users[i]] == false) {
                                    persistentObj.responseData.data.results[date].push(persistentObj.searchResult[0].preferences.users[i]);
                                }
                            }
                        }
                        if (Object.keys(persistentObj.responseData.data.results).length == persistentObj.totalDays) {
                            cbk(persistentObj.responseData);
                        }
                    },
                    cbk: cbk,
                    searchResult: searchResult,
                    responseData: responseData,
                    totalDays: endDate.diff(startDate, 'days') + 1
                };
                for (startDate; startDate.isSameOrBefore(endDate); startDate = moment(moment(startDate).add(1, "days").format("MM_DD_YYYY"), "MM_DD_YYYY")) {
                    persistentObj.sheetOptions.spreadsheetId = thisObj.driveFiles.files[startDate._i][searchResult[0].preferences.department];
                    sheets.spreadsheets.values.batchGet(persistentObj.sheetOptions, [], persistentObj.dataGenerator);
                }
            }
            else {
                thisObj.doLog();
                responseData.data.redirectURL = thisObj.url.host + thisObj.url.preferencesPage;
                cbk(responseData);
            }
        }
        else {
            thisObj.doLog();
            responseData.data.redirectURL = thisObj.url.host + thisObj.url.indexPage;
            cbk(responseData);
        }
    },
    autoAuthenticateCallHandler: function (request, response) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        console.log("AutoAuthenticate call");
        var ID = request.body.ID;
        var callLocation = request.body.location;
        var authCode;
        if (callLocation && callLocation.path) {
            if (callLocation.path == thisObj.url.authenticatePage) {
                if(request.body.authCode)
                authCode = request.body.authCode;
            }
            var responseData = {
                authentication: {},
                data: {
                    redirectURL: "",
                    links: [],
                    preferences: {},
                    results: {},
                },
                message: ""
            };
            var autoAuthCbk = function(checkStatus) {
                if (checkStatus && checkStatus.authentication && checkStatus.authentication.status) {
                    responseData.authentication = checkStatus.authentication;
                    var cbk = function (responseData) {
                        response.write(JSON.stringify(responseData));
                        response.end();
                    }
                    if (checkStatus.authentication.status == "NEW_USER" || checkStatus.authentication.status == "FAILURE") {
                        if (callLocation.path == thisObj.url.indexPage) {
                            var links = [
                                {
                                    "name": "Get Started with SKAVA MAIL",
                                    "url": thisObj.getAuthURL()
                                }
                            ];
                            responseData.data.links = links;
                        }
                        else {
                            responseData.data.redirectURL = thisObj.url.host + thisObj.url.indexPage;
                        }
                        response.write(JSON.stringify(responseData));
                        response.end();
                    }
                    else if (checkStatus.authentication.status == "IN_PROGRESS") {
                        thisObj.getAuthenticatePageData(checkStatus.searchResult, authCode, responseData, cbk);
                    }
                    else if (checkStatus.authentication.status == "SUCCESS") {
                        switch (callLocation.path) {
                            case thisObj.url.indexPage: {
                                responseData = thisObj.getIndexPageData(checkStatus.searchResult, responseData);
                                response.write(JSON.stringify(responseData));
                                response.end();
                                break;
                            }
                            case thisObj.url.preferencesPage: {
                                responseData = thisObj.getPreferencesPageData(checkStatus.searchResult, responseData);
                                response.write(JSON.stringify(responseData));
                                response.end();
                                break;
                            }
                            case thisObj.url.analysisPage: {
                                thisObj.getAnalysisPageData(checkStatus.searchResult, responseData, cbk);
                                break;
                            }
                            default: {
                                thisObj.doLog();
                            }
                        }
                    }
                    else if (checkStatus.authentication.status == "SKIPPED") {
                        responseData.data.redirectURL = thisObj.url.host + thisObj.url.indexPage;
                        response.write(JSON.stringify(responseData));
                        response.end();
                    }
                    else {
                        thisObj.doLog();
                    }
                }
                else {
                    thisObj.doLog();
                }
            }
            thisObj.checkID(ID, callLocation, autoAuthCbk);
        }
        else {
            thisObj.doLog("No callLocation Data from autoauth call");
        }
    },
    updatePreferencesCallHandler: function (request, response) {
        console.log("UpdatePreference call");
        response.writeHead(200, { 'Content-Type': 'application/json' });
        var preferences = request.body.preferences;
        var responseData = {
            "data" : {},
            "message" : ""
        };
        if (preferences && preferences.department && preferences.users && preferences.startDate && preferences.endDate) {
            var departmentIndex = thisObj.availableDepartments.indexOf(preferences.department);
            if(departmentIndex != -1) {
                var ID = request.body.ID;
                var callLocation = request.body.location;
                var startDate = moment(preferences.startDate, "MM_DD_YYYY");
                var endDate = moment(preferences.endDate, "MM_DD_YYYY");
                var minDate = moment(thisObj.driveFiles.startDate,"MM_DD_YYYY");
                var maxDate = moment(thisObj.driveFiles.endDate,"MM_DD_YYYY");
                if (startDate.isSameOrBefore(endDate) && startDate.isSameOrAfter(minDate) && endDate.isSameOrBefore(maxDate)) {
                    var updatePreferencesCbk = function(checkStatus) {
                        if (checkStatus && checkStatus.authentication && checkStatus.authentication.status) {
                            responseData.authentication = checkStatus.authentication;
                            responseData.data = {};
                            if (checkStatus.authentication.status == "SUCCESS") {
                                var email = checkStatus.searchResult[0].email;
                                var oldObj = {
                                    "email": email
                                };
                                var newObj = {
                                    $set: {
                                        "preferences": preferences
                                    }
                                };
                                var updateCbk = function(updateResult) {
                                    if (updateResult && updateResult.matchedCount) {
                                        var links = [
                                            {
                                                "name": "Results",
                                                "url": thisObj.url.host + thisObj.url.analysisPage
                                            }
                                        ];
                                        responseData.data.links = links;
                                        responseData.data.preferences = preferences;
                                        responseData.message = "Updated Successfully.";
                                    }
                                    else {
                                        responseData.message = "Database ERROR. Updation Failed";
                                        responseData.data.links = [];
                                        responseData.data.redirectURL = thisObj.url.host + thisObj.url.preferencesPage;
                                    }
                                    response.write(JSON.stringify(responseData));
                                    response.end();
                                }
                                thisObj.updateInDB(oldObj, newObj, "", updateCbk);
                            }
                            else {
                                responseData.data.redirectURL = thisObj.url.host + thisObj.url.indexPage;
                                response.write(JSON.stringify(responseData));
                                response.end();
                            }
                        }
                        else {
                            thisObj.doLog();
                        }
                    }
                    thisObj.checkID(ID, callLocation, updatePreferencesCbk);
                }
                else {
                    responseData.message = "Invalid Dates. Updation Failed";
                    responseData.data.links = [];
                    responseData.data.redirectURL = thisObj.url.host + thisObj.url.preferencesPage;
                    response.write(JSON.stringify(responseData));
                    response.end();
                }
            }
            else {
                responseData.message = "Invalid Department. Updation Failed";
                responseData.data.links = [];
                responseData.data.redirectURL = thisObj.url.host + thisObj.url.preferencesPage;
                response.write(JSON.stringify(responseData));
                response.end();
            }
        }
        else {
            responseData.message = "Insufficient Data. Updation Failed";
            responseData.data.links = [];
            responseData.data.redirectURL = thisObj.url.host + thisObj.url.preferencesPage;
            response.write(JSON.stringify(responseData));
            response.end();
        }
    },
    syncGDriveFileID: function () {
        var searchObj = {
            "ID": thisObj.db.driveFilesID
        };
        var syncGDriveCbk = function() {
            var today = moment();
            if (today.isBetween(thisObj.driveFiles.startDate, thisObj.driveFiles.endDate, "days", []) == false || thisObj.driveFiles.startDate.isSame(thisObj.driveFiles.endDate)) {
                console.log("Syncing Google drive data");
                var oauth2Client = thisObj.getTokenizedOAuth2Client(thisObj.credentials.adminRefreshToken);
                google.options({ auth: oauth2Client });
                var fileOptions = {
                    q: "name contains 'Timesheet' and mimeType = 'application/vnd.google-apps.spreadsheet'",
                    pageSize: '1000',
                    orderBy: 'createdTime desc'
                };
                drive.files.list(fileOptions, function (err, result) {
                    if (err) {
                        // Handle error
                        console.error(err);
                    }
                    else {
                        var files = {};
                        var endDate = {};
                        for (i = 0; i < result.data.files.length; i++) {
                            var name = result.data.files[i].name;
                            var nameArr = name.replace(/ /g, "").split("|");
                            if (nameArr.length == 1) {
                                nameArr[0] = nameArr[0].replace(".xlsx", "");
                                nameArr = nameArr[0].split("-Timesheet_");
                            }
                            else {
                                nameArr[0] = nameArr[0].replace("-Timesheet", "");
                            }
                            var thisDate = moment(nameArr[1], "MM_DD_YYYY");
                            if (thisDate.isSameOrAfter(thisObj.driveFiles.startDate)) {
                                if (typeof files[nameArr[1]] == "undefined") {
                                    files[nameArr[1]] = {};
                                }
                                files[nameArr[1]][nameArr[0]] = result.data.files[i].id;
                                if (thisObj.driveFiles.isUpdated == false) {
                                    endDate = thisDate;
                                }
                                thisObj.driveFiles.isUpdated = true;
                            }
                        }
                        console.log(thisObj.driveFiles);
                        if (thisObj.driveFiles.isUpdated && endDate.isAfter(thisObj.driveFiles.endDate)) {
                            thisObj.driveFiles.endDate = endDate;
                            thisObj.driveFiles.files = files;
                            var oldObj = {
                                "ID": thisObj.db.driveFilesID
                            }
                            var newObj = {
                                $set: {
                                    "startDate": thisObj.driveFiles.startDate._i,
                                    "endDate": thisObj.driveFiles.endDate._i,
                                    "files": thisObj.driveFiles.files
                                }
                            }
                            var updateCbk = function(updateObj) {
                                thisObj.driveFiles.isUpdated = false;
                                if (updateObj && updateObj.result && updateObj.result.n) {
                                    console.log("Drive files synced");
                                }
                                else {
                                    console.log("Error in syncing drive files");
                                    thisObj.doLog();
                                }
                            }
                            thisObj.updateInDB(oldObj, newObj, thisObj.db.driveFilesCollection, updateCbk);
                        }
                        else {
                            thisObj.driveFiles.isUpdated = false;
                            console.log("Drive files syncing skipped due to lacking of updated data");
                        }
                    }
                });
            }
            else {
                console.log("Drive files syncing skipped");
            }
        }
        if (thisObj.driveFiles.startDate == "" && thisObj.driveFiles.endDate == "") {
            var searchCbk = function(searchResult) {
                if (searchResult.length && searchResult[0].startDate && searchResult[0].endDate && searchResult[0].files) {
                    thisObj.driveFiles.startDate = moment(searchResult[0].startDate, "MM_DD_YYYY");
                    thisObj.driveFiles.endDate = moment(searchResult[0].endDate, "MM_DD_YYYY");
                    thisObj.driveFiles.files = searchResult[0].files;
                }
                else {
                    thisObj.driveFiles.startDate = moment("01_01_2018", "MM_DD_YYYY");
                    thisObj.driveFiles.endDate = moment("01_01_2018", "MM_DD_YYYY");
                    thisObj.driveFiles.files = [];
                }
                syncGDriveCbk();
            }
            thisObj.searchInDB(searchObj, thisObj.db.driveFilesCollection, searchCbk);
        }
        else {
            syncGDriveCbk();
        }
    }
};

app.use(express.static(path.join(__dirname, '../randomDirectory')));

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.all("/*", thisObj.requestHandler);

var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port);
    globalOAuth2Client = thisObj.getOAuthClient();
    thisObj.syncDepartmentsList();
    thisObj.syncGDriveFileID();
});