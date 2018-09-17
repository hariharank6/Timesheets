var fs = require('fs');

const {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var drive = google.drive('v3');

var sheets = google.sheets('v4');

const jsdom = require("jsdom");
const dom = new jsdom.JSDOM(`<!DOCTYPE html>`);
var $ = require("jquery")(dom.window);

var moment = require('moment');

var adminObj = require("./Administrator.js");

var DBUtils = require("./DBUtil.js");

var doLog = function () {

};

var getOAuthClient = function () {
    if(adminObj.data.credentials.clientID == "" && adminObj.data.credentials.clientSecret == "" && adminObj.data.credentials.redirectURI == "" && adminObj.data.credentials.allowedAdmins == "") {
        var credentialsFileData = fs.readFileSync(adminObj.data.url.credentialsFilePath, "utf8");
        credentialsFileData = credentialsFileData ? JSON.parse(credentialsFileData) : {};
        if (credentialsFileData.allowedAdmins && credentialsFileData.web && credentialsFileData.web.client_id && credentialsFileData.web.client_secret && credentialsFileData.web.redirect_uris[0]) {
            adminObj.data.credentials.allowedAdmins = credentialsFileData.allowedAdmins;
            adminObj.data.credentials.clientID = credentialsFileData.web.client_id;
            adminObj.data.credentials.clientSecret = credentialsFileData.web.client_secret;
            adminObj.data.credentials.redirectURI = credentialsFileData.web.redirect_uris[0];           
        }
        else {
            doLog("ERROR: can't read Credentials file");
        }
    }      
    if (adminObj.data.credentials.clientID && adminObj.data.credentials.clientSecret && adminObj.data.credentials.redirectURI) {
        oauth2Client = new OAuth2(adminObj.data.credentials.clientID, adminObj.data.credentials.clientSecret, adminObj.data.credentials.redirectURI);
        return oauth2Client;
    }
    else {
        doLog("ERROR: can't read Credentials file");
    }
};

var getAuthURL = function (isAdmin) {
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
};

var getTokenizedOAuth2Client = function (refreshToken) {
    if (refreshToken) {
        var oauth2Client = getOAuthClient();
        oauth2Client.setCredentials({
            "refresh_token":refreshToken
        });
        return oauth2Client;
    }
};

var updateAdminRefreshToken = function(data, cbk) {
    if(data && data.token && data.email) {
        if(adminObj.data.credentials.allowedAdmins[data.email]) {
            adminObj.data.credentials.adminRefreshToken = data.token;
        }
        else {
            doLog("New user tried with admin flow!!! email:"+data.email);
        }
    }
    else {
        var adminEmail = "";
        for(var i in adminObj.data.credentials.allowedAdmins) {
            if(i && adminObj.data.credentials.allowedAdmins[i] == true) {
                adminEmail = i;
                break;
            }
        }
        if(adminEmail != "") {
            var searchCbk = function(searchResult) {
                if (searchResult && searchResult[0] && searchResult[0].auth) {
                    adminObj.data.credentials.adminRefreshToken = (searchResult[0].auth.refreshToken ? searchResult[0].auth.refreshToken : "");
                    cbk();
                }
                else {
                    doLog("Drive files syncing skipped due to missing admin token");
                }
            };
            DBUtils.searchInDB({ "email": adminEmail }, "", searchCbk);
        }
        else {
            doLog();
        }
    }
};

var syncDepartmentsList = function (departmentDetails) {
    if (departmentDetails && departmentDetails.length > 0) {
        var oldObj = {
            "ID": adminObj.data.db.availableDepartmentsID
        }
        var newObj = {
            $set: { "departments": departmentDetails }
        }
        var updateCbk = function(updateObj) {
            if (updateObj && updateObj.length > 0) {
                adminObj.data.availableDepartments = departmentDetails;
                console.log("Available departments synced");
            }
            else {
                doLog();
            }
        }
        DBUtils.updateInDB(oldObj, newObj, adminObj.data.db.departmentsCollection, updateCbk);
    }
    else {
        var searchObj = {
            "ID": adminObj.data.db.availableDepartmentsID
        }
        var searchCbk = function(availableDepartmentsObj) {
            if (availableDepartmentsObj && availableDepartmentsObj[0] && availableDepartmentsObj[0].departments) {
                adminObj.data.availableDepartments = availableDepartmentsObj[0].departments;
                console.log("Fetched available departments");
            }
            else {
                adminObj.data.availableDepartments = [];
                doLog();
            }
        }
        DBUtils.searchInDB(searchObj, adminObj.data.db.departmentsCollection, searchCbk);
    }
};

var checkID = function (ID, callLocation, cbk) {
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
        if (callLocation && callLocation.path == adminObj.data.url.authenticatePage) {
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
                if (callLocation && callLocation.path == adminObj.data.url.authenticatePage) {
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
        DBUtils.searchInDB({ "ID": ID }, "",searchCbk);
    }
};

var syncGDriveFileID = function () {
    var syncGDriveCbk = function() {
        var today = moment();
        if (today.isBetween(adminObj.data.driveFiles.startDate, adminObj.data.driveFiles.endDate, "days", []) == false || adminObj.data.driveFiles.startDate.isSame(adminObj.data.driveFiles.endDate)) {
            console.log("Syncing Google drive data");
            adminObj.data.driveFiles.isSyncInProgress = true;
            var cbk = function() {
                var oauth2Client = getTokenizedOAuth2Client(adminObj.data.credentials.adminRefreshToken);
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
                        doLog();
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
                            if (thisDate.isSameOrAfter(adminObj.data.driveFiles.endDate)) {
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
                                if (adminObj.data.driveFiles.isUpdated == false) {
                                    endDate = thisDate;
                                }
                                adminObj.data.driveFiles.isUpdated = true;
                            }
                        }
                        console.log(adminObj.data.driveFiles);
                        if (adminObj.data.driveFiles.isUpdated) {                                
                            var metaDataCbk = function() {                                    
                                adminObj.data.driveFiles.endDate = endDate;                                    
                                $.extend(adminObj.data.driveFiles.files,files);
                                var oldObj = {
                                    "ID": adminObj.data.db.driveFilesID
                                }
                                var newObj = {
                                    $set: {
                                        "startDate": adminObj.data.driveFiles.startDate._i,
                                        "endDate": adminObj.data.driveFiles.endDate._i,
                                        "files": adminObj.data.driveFiles.files
                                    }
                                }
                                var updateCbk = function(updateObj) {
                                    adminObj.data.driveFiles.isUpdated = false;
                                    adminObj.data.driveFiles.isSyncInProgress = false;
                                    if (updateObj && updateObj.result && updateObj.result.n) {
                                        console.log("Drive files synced");
                                    }
                                    else {
                                        console.log("Error in syncing drive files");
                                        doLog();
                                    }
                                }
                                DBUtils.updateInDB(oldObj, newObj, adminObj.data.db.driveFilesCollection, updateCbk);
                            };
                            getGDriveFileMetadata(files, tabsArray, metaDataCbk);
                        }
                        else {
                            adminObj.data.driveFiles.isUpdated = false;
                            console.log("Drive files syncing skipped due to lacking of updated data");
                        }
                    }
                });
            }
            if(adminObj.data.credentials.adminRefreshToken == "") {
                updateAdminRefreshToken(null, cbk);
            }
            else {
                cbk();
            }
        }
        else {
            console.log("Drive files syncing skipped");
        }
    };
    if(!adminObj.data.driveFiles.isSyncInProgress) {
        if (adminObj.data.driveFiles.startDate == "" && adminObj.data.driveFiles.endDate == "") {
            var searchObj = {
                "ID": adminObj.data.db.driveFilesID
            };
            var searchCbk = function(searchResult) {
                if (searchResult.length && searchResult[0].startDate && searchResult[0].endDate && searchResult[0].files) {
                    adminObj.data.driveFiles.startDate = moment(searchResult[0].startDate, "MM_DD_YYYY");
                    adminObj.data.driveFiles.endDate = moment(searchResult[0].endDate, "MM_DD_YYYY");
                    adminObj.data.driveFiles.files = searchResult[0].files;
                }
                else {
                    adminObj.data.driveFiles.startDate = moment(adminObj.data.driveFiles.defaultStartDate, "MM_DD_YYYY");
                    adminObj.data.driveFiles.endDate = moment(adminObj.data.driveFiles.defaultStartDate, "MM_DD_YYYY");
                    adminObj.data.driveFiles.files = [];
                }
                syncGDriveCbk();
            }
            DBUtils.searchInDB(searchObj, adminObj.data.db.driveFilesCollection, searchCbk);
        }
        else {
            syncGDriveCbk();
        }
    }
    else {
        console.log("Google files syncing is already in progress");
    }
};

var getGDriveFileMetadata = function (files, tabsArray, cbk) {
    var persistentObj = {
        sheetOptions: {
            spreadsheetId: '1MDZ6TvX0kCZnFAYpAoNKLnLJUWfE2ARFkXLkdVJpwd8'
        },
        dataGenerator: function(error, result) {
            if(error) {
                console.error(error);
                doLog(error);
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
                                doLog("tab name missing in meta API");
                            }
                        }
                        persistentObj.files[thisDate._i][titleArr[0]].tabs = tabs;
                    }
                }
                else {
                    doLog("Insufficient data");
                }
            }
            ++persistentObj.finishedSheets;
            if (persistentObj.totalSheets == persistentObj.finishedSheets) {
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
                    doLog("sheetId missing");
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
        var oauth2Client = getTokenizedOAuth2Client(adminObj.data.credentials.adminRefreshToken);
        google.options({ auth: oauth2Client });
        persistentObj.metaDataCallDispathcher();    //To dispatch calls in the mentioned time periods
    }
    if(adminObj.data.credentials.adminRefreshToken == "") {
        updateAdminRefreshToken(null, tokenCbk);
    }
    else {
        tokenCbk();
    }
};

exports.doLog = doLog;

exports.getOAuthClient = getOAuthClient;

exports.getAuthURL = getAuthURL;

exports.getTokenizedOAuth2Client = getTokenizedOAuth2Client;

exports.updateAdminRefreshToken = updateAdminRefreshToken;

exports.syncDepartmentsList = syncDepartmentsList;

exports.checkID = checkID;

exports.syncGDriveFileID = syncGDriveFileID;

exports.getGDriveFileMetadata = getGDriveFileMetadata;