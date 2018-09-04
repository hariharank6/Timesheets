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
    "$": $, // Temporary solution for scope
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
        adminRefreshToken: "",
        allowedAdmins: ""
    },
    availableDepartments: [],
    driveFiles: {
        isSyncInProgress: false,
        startDate: "",
        endDate: "",
        isUpdated: false,
        files: {}
    },
    doLog: function () {

    },
    getOAuthClient: function () {
        if(thisObj.credentials.clientID == "" && thisObj.credentials.clientSecret == "" && thisObj.credentials.redirectURI == "" && thisObj.credentials.allowedAdmins == "") {
            var credentialsFileData = fs.readFileSync(thisObj.url.credentialsFilePath, "utf8");
            credentialsFileData = credentialsFileData ? JSON.parse(credentialsFileData) : {};
            if (credentialsFileData.allowedAdmins && credentialsFileData.web && credentialsFileData.web.client_id && credentialsFileData.web.client_secret && credentialsFileData.web.redirect_uris[0]) {
                thisObj.credentials.allowedAdmins = credentialsFileData.allowedAdmins;
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
    getAuthURL: function (isAdmin) {
        var scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/spreadsheets'
        ];
        var state = "notAdmin";
        if(isAdmin) {
            scopes.push('https://www.googleapis.com/auth/drive');
            state = "admin";
        }
        var authUrlConfig = {
            'access_type': 'offline',
            'prompt': 'consent',
            'scope': scopes,
            'state': state
        };
        var authUrl = globalOAuth2Client.generateAuthUrl(authUrlConfig);
        console.log(authUrl);
        return authUrl;
    },
    getTokenizedOAuth2Client: function (refreshToken) {
        if (refreshToken) {
            var oauth2Client = thisObj.getOAuthClient();
            oauth2Client.setCredentials({
                "refresh_token":refreshToken
            });
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
    updateAdminRefreshToken: function(data, cbk) {
        if(data && data.token && data.email) {
            if(thisObj.credentials.allowedAdmins[data.email]) {
                thisObj.credentials.adminRefreshToken = data.token;
            }
            else {
                thisObj.doLog("New user tried with admin flow!!! email:"+data.email);
            }
        }
        else {
            var adminEmail = "";
            for(var i in thisObj.credentials.allowedAdmins) {
                if(i && thisObj.credentials.allowedAdmins[i] == true) {
                    adminEmail = i;
                    break;
                }
            }
            if(adminEmail != "") {
                var searchCbk = function(searchResult) {
                    if (searchResult && searchResult[0] && searchResult[0].auth) {
                        thisObj.credentials.adminRefreshToken = (searchResult[0].auth.refreshToken ? searchResult[0].auth.refreshToken : "");
                        cbk();
                    }
                    else {
                        thisObj.doLog("Drive files syncing skipped due to missing admin token");
                    }
                };
                thisObj.searchInDB({ "email": adminEmail }, "", searchCbk);
            }
            else {
                thisObj.doLog();
            }
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
    getAuthenticatePageData: function (searchResult, userConfig, responseData, cbk) {
        console.log("Autheticate page");    //
        if (userConfig && userConfig.authCode && userConfig.authCode != "accessDenied") {
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
                                persistentObj.email = userInfo.email;
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
                                            if(persistentObj.userConfig && persistentObj.userConfig.state && persistentObj.userConfig.state == "admin") {
                                                thisObj.updateAdminRefreshToken({'email' : persistentObj.email, 'token' : persistentObj.refreshToken});
                                            }
                                            if (persistentObj.cbk) {
                                                persistentObj.cbk(persistentObj.responseData);
                                            }
                                        }
                                        if (persistentObj.refreshToken) {
                                            var oldObj = {
                                                "email": persistentObj.email
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
                                            email: persistentObj.email,
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
                                            if(persistentObj.userConfig && persistentObj.userConfig.state && persistentObj.userConfig.state == "admin") {
                                                thisObj.updateAdminRefreshToken({'email' : persistentObj.email, 'token' : persistentObj.refreshToken});
                                            }
                                            if (persistentObj.cbk) {
                                                persistentObj.cbk(persistentObj.responseData);
                                            }
                                        }
                                        thisObj.insertIntoDB(DBentry, "", insertCbk);
                                    }
                                }
                                thisObj.searchInDB({ "email": persistentObj.email }, "", searchCbk);
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
                'responseData': responseData,
                'cbk': cbk,
                'refreshToken': "",
                'idToken': "",
                'userConfig': userConfig,
                'email': ""
            }
            globalOAuth2Client.getToken(userConfig.authCode, persistentObj.tokenGenerator);
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
                        ranges: [],
                        valueRenderOption: 'UNFORMATTED_VALUE'
                    },
                    dataGenerator: function (error, result) {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            var currSheetId = result && result.data && result.data.spreadsheetId ? result.data.spreadsheetId : "";
                            var date = "";
                            for (keys in thisObj.driveFiles.files) {
                                for (subkeys in thisObj.driveFiles.files[keys]) {
                                    if (thisObj.driveFiles.files[keys][subkeys].sheetId == currSheetId) {
                                        persistentObj.responseData.data.results[keys] = {
                                            "sheetId" : currSheetId,
                                            "users" : []
                                        };
                                        date = keys;
                                        break;
                                    }
                                }
                                if (date != "") {
                                    break;
                                }
                            }
                            if(currSheetId && date) {
                                var userData = {};
                                for(x = 0; x < result.data.valueRanges.length; x+= 2) {
                                    var userNames = result.data.valueRanges[x].values[0];
                                    var userResponse = result.data.valueRanges[x+1].values[0];

                                    for (var i = 0; i < userNames.length; i++) {
                                        if (userResponse[i] == undefined || userResponse[i] == "" || userResponse[i] == 0) {
                                            userData[userNames[i]] = {
                                                status: "empty",
                                            }
                                        }
                                        else if (userResponse[i] < 0.3333333333333333) {
                                            userData[userNames[i]] = {
                                                status: "partial"
                                            }
                                        }
                                        else {
                                            userData[userNames[i]] = {
                                                status: "filled"
                                            }
                                        }
                                        userData[userNames[i]].tabName = result.data.valueRanges[x].range.split("!")[0];
                                        userData[userNames[i]].dimension = "C" + (i+6) + ":DB" + (i+6);
                                    }
                                }
                                for (var i = 0; i < persistentObj.searchResult[0].preferences.users.length; i++) {
                                    persistentObj.responseData.data.results[date].users.push({[persistentObj.searchResult[0].preferences.users[i]] : userData[persistentObj.searchResult[0].preferences.users[i]]});
                                }
                            }
                            else {
                                thisObj.doLog("Google sheet api data missing");
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
                    persistentObj.sheetOptions.spreadsheetId = thisObj.driveFiles.files[startDate._i][searchResult[0].preferences.department].sheetId;
                    persistentObj.sheetOptions.ranges = [];
                    for(tab in thisObj.driveFiles.files[startDate._i][searchResult[0].preferences.department].tabs) {
                        if(thisObj.driveFiles.files[startDate._i][searchResult[0].preferences.department].tabs[tab]) {
                            persistentObj.sheetOptions.ranges.push(tab+"!C6:C");
                            persistentObj.sheetOptions.ranges.push(tab+"!DB6:DB");
                        }
                    }
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
        var requestParams = request.body.requestParams ? request.body.requestParams : "";
        var authCode;
        var isAdmin = false;
        var reqState = "";
        if (callLocation && callLocation.path) {
            if (callLocation.path == thisObj.url.authenticatePage) {
                if(requestParams["code"]) {
                    authCode = requestParams["code"];
                }
            }
            if(requestParams["state"]) {
                reqState = requestParams["state"];
            }
            if(reqState == "admin") {
                isAdmin = true;
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
                                    "url": isAdmin ? thisObj.getAuthURL(true) : thisObj.getAuthURL(false)
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
                        var userConfig = {
                            "authCode":authCode,
                            "state":reqState
                        };
                        thisObj.getAuthenticatePageData(checkStatus.searchResult, userConfig, responseData, cbk);
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
        var syncGDriveCbk = function() {
            var today = moment();
            if (today.isBetween(thisObj.driveFiles.startDate, thisObj.driveFiles.endDate, "days", []) == false || thisObj.driveFiles.startDate.isSame(thisObj.driveFiles.endDate)) {
                console.log("Syncing Google drive data");
                thisObj.driveFiles.isSyncInProgress = true;
                var cbk = function() {
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
                            thisObj.doLog();
                        }
                        else {
                            var files = {};
                            var tabsArray = [];
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
                                if (thisDate.isSameOrAfter(thisObj.driveFiles.endDate)) {
                                    if (typeof files[nameArr[1]] == "undefined") {
                                        files[nameArr[1]] = {};
                                    }
                                    var fileData = {
                                        sheetId : result.data.files[i].id,
                                        tabs : {}
                                    };
                                    files[nameArr[1]][nameArr[0]] = fileData;
                                    tabsArray.push({
                                        sheetId : fileData.sheetId
                                    });
                                    if (thisObj.driveFiles.isUpdated == false) {
                                        endDate = thisDate;
                                    }
                                    thisObj.driveFiles.isUpdated = true;
                                }
                            }
                            console.log(thisObj.driveFiles);
                            if (thisObj.driveFiles.isUpdated) {                                
                                var metaDataCbk = function() {                                    
                                    thisObj.driveFiles.endDate = endDate;                                    
                                    thisObj.$.extend(thisObj.driveFiles.files,files);
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
                                        thisObj.driveFiles.isSyncInProgress = false;
                                        if (updateObj && updateObj.result && updateObj.result.n) {
                                            console.log("Drive files synced");
                                        }
                                        else {
                                            console.log("Error in syncing drive files");
                                            thisObj.doLog();
                                        }
                                    }
                                    thisObj.updateInDB(oldObj, newObj, thisObj.db.driveFilesCollection, updateCbk);
                                };
                                thisObj.getGDriveFileMetadata(files, tabsArray, metaDataCbk);
                            }
                            else {
                                thisObj.driveFiles.isUpdated = false;
                                console.log("Drive files syncing skipped due to lacking of updated data");
                            }
                        }
                    });
                }
                if(thisObj.credentials.adminRefreshToken == "") {
                    thisObj.updateAdminRefreshToken(null, cbk);
                }
                else {
                    cbk();
                }
            }
            else {
                console.log("Drive files syncing skipped");
            }
        };
        if(!thisObj.driveFiles.isSyncInProgress) {
            if (thisObj.driveFiles.startDate == "" && thisObj.driveFiles.endDate == "") {
                var searchObj = {
                    "ID": thisObj.db.driveFilesID
                };
                var searchCbk = function(searchResult) {
                    if (searchResult.length && searchResult[0].startDate && searchResult[0].endDate && searchResult[0].files) {
                        thisObj.driveFiles.startDate = moment(searchResult[0].startDate, "MM_DD_YYYY");
                        thisObj.driveFiles.endDate = moment(searchResult[0].endDate, "MM_DD_YYYY");
                        thisObj.driveFiles.files = searchResult[0].files;
                    }
                    else {
                        thisObj.driveFiles.startDate = moment("07_01_2018", "MM_DD_YYYY");
                        thisObj.driveFiles.endDate = moment("07_01_2018", "MM_DD_YYYY");
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
        else {
            console.log("Google files syncing is already in progress");
        }
    },
    getGDriveFileMetadata: function (files, tabsArray, cbk) {
        var persistentObj = {
            sheetOptions: {
                spreadsheetId: '1MDZ6TvX0kCZnFAYpAoNKLnLJUWfE2ARFkXLkdVJpwd8'
            },
            dataGenerator: function(error, result) {
                if(error) {
                    console.error(error);
                    thisObj.doLog(error);
                }
                else {
                    if(result.data && result.data.spreadsheetId && result.data.properties && result.data.properties.title && result.data.sheets && result.data.sheets.length) {
                        var tabs = {};
                        var title = result.data.properties.title;
                        var titleArr = title.replace(/ /g, "").split("|");
                        if (titleArr.length == 1) {
                            titleArr[0] = titleArr[0].replace(".xlsx", "");
                            titleArr = titleArr[0].split("-Timesheet_");
                        }
                        else {
                            titleArr[0] = titleArr[0].replace("-Timesheet", "");
                        }
                        var thisDate = moment(titleArr[1], "MM_DD_YYYY");
                        if(persistentObj.files && persistentObj.files[thisDate._i] && persistentObj.files[thisDate._i][titleArr[0]]) {
                            for(i = 0; i < result.data.sheets.length; i++) {
                                var tabName = result.data.sheets[i] && result.data.sheets[i].properties && result.data.sheets[i].properties.title ? result.data.sheets[i].properties.title : "";
                                if(tabName != "") {
                                    formattedTabName = tabName.toLowerCase();
                                    formattedTabName = formattedTabName.replace(/ /g,"");
                                    if(formattedTabName == "projectcode" || formattedTabName == "tasks" || formattedTabName == "tasks-solnecom") {
                                        tabs[tabName] = false;
                                    }
                                    else {
                                        tabs[tabName] = true;
                                    }                                    
                                }
                                else {
                                    thisObj.doLog("tab name missing in meta API");
                                }
                            }
                            persistentObj.files[thisDate._i][titleArr[0]].tabs = tabs;
                        }
                    }
                    else {
                        thisObj.doLog("Insufficient data");
                    }
                }
                ++persistentObj.finishedSheets;
                if (persistentObj.totalSheets == persistentObj.finishedSheets) {
                    thisObj.driveFiles.files = persistentObj.files;
                    persistentObj.cbk(persistentObj.files);
                }
            },
            metaDataCallDispathcher : function() {                
                for(persistentObj.currentTabsIndex; persistentObj.currentTabsIndex < persistentObj.tabsArray.length; persistentObj.currentTabsIndex++) {
                    if(persistentObj.tabsArray[persistentObj.currentTabsIndex].sheetId) {
                        persistentObj.sheetOptions.spreadsheetId = persistentObj.tabsArray[persistentObj.currentTabsIndex].sheetId;
                        sheets.spreadsheets.get(persistentObj.sheetOptions, persistentObj.dataGenerator);
                        if(persistentObj.currentTabsIndex && persistentObj.currentTabsIndex % 49 == 0 && persistentObj.currentTabsIndex != persistentObj.tabsArray.length - 1) {
                            persistentObj.currentTabsIndex++;
                            setTimeout(function() {
                                console.log("Syncing " + persistentObj.currentTabsIndex + " / " + persistentObj.tabsArray.length);
                                persistentObj.metaDataCallDispathcher();
                            },100000);
                            break;
                        }
                    }
                    else {
                        thisObj.doLog("sheetId missing");
                    }
                }
            },
            cbk: cbk,
            files : files,
            tabsArray : tabsArray,
            currentTabsIndex : 0,
            totalSheets : tabsArray.length,
            finishedSheets : 0
        }
        var tokenCbk = function() {
            var oauth2Client = thisObj.getTokenizedOAuth2Client(thisObj.credentials.adminRefreshToken);
            google.options({ auth: oauth2Client });
            persistentObj.metaDataCallDispathcher();    //To dispatch calls in the mentioned time periods
        }
        if(thisObj.credentials.adminRefreshToken == "") {
            thisObj.updateAdminRefreshToken(null, tokenCbk);
        }
        else {
            tokenCbk();
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