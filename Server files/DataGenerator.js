var randomString = require("randomstring");

const jsdom = require("jsdom");
const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
var $ = require("jquery")(dom.window);

var moment = require('moment');

const {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var sheets = google.sheets('v4');   //need optimization from Util.js

var adminObj = require("./Administrator.js");

var DBUtils = require("./DBUtil.js");

var utils = require("./Util.js");

var getIndexPageData = function (searchResult, responseData) {
    console.log("Index page");
    utils.syncGDriveFileID();
    if (searchResult && searchResult[0].preferences && searchResult[0].preferences.department && searchResult[0].preferences.startDate && searchResult[0].preferences.endDate) {
        var links = [
            {
                "name": "Preferences",
                "url": adminObj.data.url.host + adminObj.data.url.preferencesPage
            },
            {
                "name": "Results",
                "url": adminObj.data.url.host + adminObj.data.url.analysisPage
            }
        ];
    }
    else {
        var links = [
            {
                "name": "Preferences",
                "url": adminObj.data.url.host + adminObj.data.url.preferencesPage
            }
        ];
    }
    responseData.data.links = links;
    responseData.data.preferences = searchResult[0].preferences;
    return responseData;
};

var getAuthenticatePageData = function (searchResult, userConfig, responseData, cbk) {
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
                                            persistentObj.responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.indexPage;
                                        }
                                        else {
                                            persistentObj.responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.preferencesPage;
                                        }
                                        if(persistentObj.userConfig && persistentObj.userConfig.state && persistentObj.userConfig.state == "admin") {
                                            utils.updateAdminRefreshToken({'email' : persistentObj.email, 'token' : persistentObj.refreshToken});
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
                                        DBUtils.updateInDB(oldObj, newObj, "", tempCbk);
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
                                            persistentObj.responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.preferencesPage;
                                        }
                                        else {
                                            utils.doLog();
                                        }
                                        if(persistentObj.userConfig && persistentObj.userConfig.state && persistentObj.userConfig.state == "admin") {
                                            utils.updateAdminRefreshToken({'email' : persistentObj.email, 'token' : persistentObj.refreshToken});
                                        }
                                        if (persistentObj.cbk) {
                                            persistentObj.cbk(persistentObj.responseData);
                                        }
                                    }
                                    DBUtils.insertIntoDB(DBentry, "", insertCbk);
                                }
                            }
                            DBUtils.searchInDB({ "email": persistentObj.email }, "", searchCbk);
                        }
                        else {
                            persistentObj.responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.indexPage;
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
        utils.doLog("authCode failure");
        responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.indexPage;
        responseData.message = "Please authorize the app to get started";
        cbk(responseData);
    }
};

var getPreferencesPageData = function (searchResult, responseData) {
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
    responseData.data.preferences.availableDepartments = adminObj.data.availableDepartments;
    responseData.data.preferences.minDate = adminObj.data.driveFiles.startDate._i;
    responseData.data.preferences.maxDate = adminObj.data.driveFiles.endDate._i;
    return responseData;
};

var getAnalysisPageData = function (searchResult, responseData, cbk) {
    console.log("Analysis page");
    if (searchResult && searchResult[0].auth && searchResult[0].auth.refreshToken) {
        var oauth2Client = utils.getTokenizedOAuth2Client(searchResult[0].auth.refreshToken);
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
                        for (keys in adminObj.data.driveFiles.files) {
                            for (subkeys in adminObj.data.driveFiles.files[keys]) {
                                if (adminObj.data.driveFiles.files[keys][subkeys].sheetId == currSheetId) {
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
                                    userNames[i] = userNames[i].trim();
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
                            utils.doLog("Google sheet api data missing");
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
                persistentObj.sheetOptions.spreadsheetId = adminObj.data.driveFiles.files[startDate._i][searchResult[0].preferences.department].sheetId;
                persistentObj.sheetOptions.ranges = [];
                for(tab in adminObj.data.driveFiles.files[startDate._i][searchResult[0].preferences.department].tabs) {
                    if(adminObj.data.driveFiles.files[startDate._i][searchResult[0].preferences.department].tabs[tab]) {
                        persistentObj.sheetOptions.ranges.push(tab+"!C6:C");
                        persistentObj.sheetOptions.ranges.push(tab+"!DB6:DB");
                    }
                }
                sheets.spreadsheets.values.batchGet(persistentObj.sheetOptions, [], persistentObj.dataGenerator);
            }
        }
        else {
            utils.doLog();
            responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.preferencesPage;
            cbk(responseData);
        }
    }
    else {
        utils.doLog();
        responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.indexPage;
        cbk(responseData);
    }
};

var autoAuthenticateCallHandler = function (request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    console.log("AutoAuthenticate call");
    var ID = request.body.ID;
    var callLocation = request.body.location;
    var requestParams = request.body.requestParams ? request.body.requestParams : "";
    var authCode;
    var isAdmin = false;
    var reqState = "";
    if (callLocation && callLocation.path) {
        if (callLocation.path == adminObj.data.url.authenticatePage) {
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
                    if (callLocation.path == adminObj.data.url.indexPage) {
                        var links = [
                            {
                                "name": "Get Started with SKAVA MAIL",
                                "url": isAdmin ? utils.getAuthURL(true) : utils.getAuthURL(false)
                            }
                        ];
                        responseData.data.links = links;
                    }
                    else {
                        responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.indexPage;
                    }
                    response.write(JSON.stringify(responseData));
                    response.end();
                }
                else if (checkStatus.authentication.status == "IN_PROGRESS") {
                    var userConfig = {
                        "authCode":authCode,
                        "state":reqState
                    };
                    getAuthenticatePageData(checkStatus.searchResult, userConfig, responseData, cbk);
                }
                else if (checkStatus.authentication.status == "SUCCESS") {
                    switch (callLocation.path) {
                        case adminObj.data.url.indexPage: {
                            responseData = getIndexPageData(checkStatus.searchResult, responseData);
                            response.write(JSON.stringify(responseData));
                            response.end();
                            break;
                        }
                        case adminObj.data.url.preferencesPage: {
                            responseData = getPreferencesPageData(checkStatus.searchResult, responseData);
                            response.write(JSON.stringify(responseData));
                            response.end();
                            break;
                        }
                        case adminObj.data.url.analysisPage: {
                            getAnalysisPageData(checkStatus.searchResult, responseData, cbk);
                            break;
                        }
                        default: {
                            utils.doLog();
                        }
                    }
                }
                else if (checkStatus.authentication.status == "SKIPPED") {
                    responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.indexPage;
                    response.write(JSON.stringify(responseData));
                    response.end();
                }
                else {
                    utils.doLog();
                }
            }
            else {
                utils.doLog();
            }
        }
        utils.checkID(ID, callLocation, autoAuthCbk);
    }
    else {
        utils.doLog("No callLocation Data from autoauth call");
    }
};

var updatePreferencesCallHandler = function (request, response) {
    console.log("UpdatePreference call");
    response.writeHead(200, { 'Content-Type': 'application/json' });
    var preferences = request.body.preferences;
    var responseData = {
        "data" : {},
        "message" : ""
    };
    if (preferences && preferences.department && preferences.users && preferences.startDate && preferences.endDate) {
        var departmentIndex = adminObj.data.availableDepartments.indexOf(preferences.department);
        if(departmentIndex != -1) {
            var ID = request.body.ID;
            var callLocation = request.body.location;
            var startDate = moment(preferences.startDate, "MM_DD_YYYY");
            var endDate = moment(preferences.endDate, "MM_DD_YYYY");
            var minDate = moment(adminObj.data.driveFiles.startDate,"MM_DD_YYYY");
            var maxDate = moment(adminObj.data.driveFiles.endDate,"MM_DD_YYYY");
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
                                            "url": adminObj.data.url.host + adminObj.data.url.analysisPage
                                        }
                                    ];
                                    responseData.data.links = links;
                                    responseData.data.preferences = preferences;
                                    responseData.message = "Updated Successfully.";
                                }
                                else {
                                    responseData.message = "Database ERROR. Updation Failed";
                                    responseData.data.links = [];
                                    responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.preferencesPage;
                                }
                                response.write(JSON.stringify(responseData));
                                response.end();
                            }
                            DBUtils.updateInDB(oldObj, newObj, "", updateCbk);
                        }
                        else {
                            responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.indexPage;
                            response.write(JSON.stringify(responseData));
                            response.end();
                        }
                    }
                    else {
                        utils.doLog();
                    }
                }
                utils.checkID(ID, callLocation, updatePreferencesCbk);
            }
            else {
                responseData.message = "Invalid Dates. Updation Failed";
                responseData.data.links = [];
                responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.preferencesPage;
                response.write(JSON.stringify(responseData));
                response.end();
            }
        }
        else {
            responseData.message = "Invalid Department. Updation Failed";
            responseData.data.links = [];
            responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.preferencesPage;
            response.write(JSON.stringify(responseData));
            response.end();
        }
    }
    else {
        responseData.message = "Insufficient Data. Updation Failed";
        responseData.data.links = [];
        responseData.data.redirectURL = adminObj.data.url.host + adminObj.data.url.preferencesPage;
        response.write(JSON.stringify(responseData));
        response.end();
    }
};

exports.getIndexPageData = getIndexPageData;

exports.getAuthenticatePageData = getAuthenticatePageData;

exports.getPreferencesPageData = getPreferencesPageData;

exports.getAnalysisPageData = getAnalysisPageData;

exports.autoAuthenticateCallHandler = autoAuthenticateCallHandler;

exports.updatePreferencesCallHandler = updatePreferencesCallHandler;