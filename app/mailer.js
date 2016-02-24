var unirest = require('unirest');
var _ = require('lodash');
var utils = require('./lib/Utils');
var csv = require('./lib/CSVParser');
var q = require('q');
var options = {
    isTest: true,
    debugLevel: 1
};
var emailer;

function loadOptions() {
    'use strict';

    function areOptionsValid() {
        return options.emailDirectoryName && options.csvFileName;
    }

    _.forEach(process.argv, function(option) {
        if (option === '--live=true') {
            options.isTest = false;
        } else if (option.match(/--emailDir=.*/)) {
            options.emailDirectoryName = option.split('=')[1];
        } else if (option.match(/--csvFile=.*/)) {
            options.csvFileName = option.split('=')[1];
        } else if (option.match(/--debugLevel=\d+/)) {
            options.debugLevel = option.split('=')[1];
        } else if (option === '-h' || option === '--help') {
            utils.debug('Help:');
            utils.debug('--emailDir=<String>; The name of the directory for the email body and subject files.');
            utils.debug('--csvFile=<String>; The name of the csv file containing all the client names');
            utils.debug('--debugLevel=<Integer>; The level to debugging output. The default is <1>');
            utils.debug('--live=true; Whether to send emails or just test emails. The default is <false>');
            process.exit();
        }
    });

    utils.setDebugLevel(options.debugLevel);
    return areOptionsValid();
}

var BLEmailer = function() {
    'use strict';
    this.CookieJar = unirest.jar();
    this.user = utils.getUser();
};

BLEmailer.prototype = (function() {
    'use strict';
    return {
        loadClientList: function() {
            var self = this;
            var filePath = utils.getFilePath(['app', 'csvFiles', options.csvFileName]);
            var clientsLoaded = function(clients) {
                self.postEmail(clients);
            };
            csv.buildCSV(filePath, clientsLoaded);
        },
        addCookie: function(response) {
            if (response && response.headers) {
                _.forEach(response.headers['set-cookie'], function(cookie) {
                    this.CookieJar.add(unirest.cookie(cookie));
                });
            }
        },
        postEmail: function(clients) {
            var deferred = q.defer();
            var url = options.isTest ? 'http://bl-test-server.com/post.php' : 'https://www.bricklink.com/contact.asp';
            var self = this;
            var emailObject = utils.getEmailObject(options.emailDirectoryName);
            var executeHttpRequest = function(client) {
                var resource = unirest.post(url);
                var brickLinkUserName = options.isTest ? 'cedarsith' : client.username;
                resource
                    .jar(self.CookieJar)
                    .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:44.0) Gecko/20100101 Firefox/44.0')
                    .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
                    .query({
                        action: 'send'
                    })
                    .form({
                        allmsgemail: 'brianpilati@gmail.com',
                        p_body: emailObject.emailBody,
                        p_subject: emailObject.emailSubject,
                        u: brickLinkUserName,
                        viewFrom: 'I',
                        adminCode: '',
                        adminType: '',
                        allcontact: '',
                        contactEmail: '',
                        contactType: '',
                        msgEmail: '',
                        msgID: '',
                        msgThreadID: '',
                        myMsgID: '',
                        orderID: '',
                        qorderID: '',
                        viewType: ''
                    })
                    .end(function(response) {
                        utils.debug(response.body, 2);
                        utils.debug('Emailed: ' + client.username + ' Status:' + response.status, 1);

                        if (response.status !== 200) {
                            utils.writeToFile('postEmail_' + client.username, response.body);
                        }
                        deferred.resolve(response.status);
                    });
                return deferred.promise;
            };
            _.forEach(clients, function(client) {
                executeHttpRequest(client).then(function(status) {
                    client.status = status;
                });
            });
        },
        login: function() {
            var self = this;
            var url = options.isTest ? 'http://bl-test-server.com/post.php?function=login' : 'https://www.bricklink.com/login.asp';
            var resource = unirest.post(url);
            return resource
                .jar(this.CookieJar)
                .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
                .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:44.0) Gecko/20100101 Firefox/44.0')
                .query({
                    logInTo: '',
                    logFolder: 'z',
                    logSub: 'z'
                })
                .form({
                    a: 'a',
                    frmUsername: this.user.getUsername(),
                    frmPassword: this.user.getPassword()
                })
                .end(function(response) {
                    utils.debug(response.body, 2);
                    utils.debug('Logged In Status: ' + response.status);
                    self.addCookie(response);
                    utils.writeToFile('login', response.body);
                    self.loadClientList();
                });
        }
    };
})();

if (loadOptions()) {
    emailer = new BLEmailer();
    utils.debug('This is a ' + (options.isTest ? '"Test"' : '"Live"') + ' Run');
    emailer.login();
} else {
    utils.debug('Error');
}
