var url = require('url');

var utils = require("./Util.js");

var dataGenerator = require("./DataGenerator.js");

data = {
    url: {
        host: "https://192.168.233.73.xip.io:8080",
        indexPage: "/index.html",
        authenticatePage: "/authenticate.html",
        preferencesPage: "/preferences.html",
        analysisPage: "/analysis.html",
        autoAuthenticateCall: "/autoAuthenticate",
        updatePreferencesCall: "/updatePreference",
        refreshDepartmentsCall: "/refreshDepartments",
        credentialsFilePath: "Server files/credentials.json",
        certificatesFilePath: "Server files/certificates/",
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
        defaultStartDate: "07_01_2018",
        startDate: "",
        endDate: "",
        isUpdated: false,
        files: {}
    }
}

globalOAuth2Client = "";

exports.data = data;

exports.globalOAuth2Client = globalOAuth2Client;

exports.requestHandler = function (request, response) {
    var requestUrl = url.parse(request.url, true);
    var pathName = requestUrl.pathname;
    switch (pathName) {
        case data.url.autoAuthenticateCall: {
            dataGenerator.autoAuthenticateCallHandler(request, response);
            break;
        }
        case data.url.updatePreferencesCall: {
            dataGenerator.updatePreferencesCallHandler(request, response);
            break;
        }
        default: {
            response.redirect(data.url.host + data.url.indexPage);
            break;
        }
    }
}
exports.serverStartCbk = function() {
    console.log("Timesheets app listening at %s", data.url.host);
    globalOAuth2Client = utils.getOAuthClient();
    utils.syncDepartmentsList();
    utils.syncGDriveFileID();
}