var unirest = require('unirest');
var _ = require('lodash');
var utils = require('./lib/Utils');

var BLEmailer = function() {
    this.CookieJar = unirest.jar();
    this.user = utils.getUser();
}

BLEmailer.prototype = {
    addCookie: function(response) {
        if (response && response.headers) {
            _.forEach(response.headers['set-cookie'], function(cookie) {
                this.CookieJar.add(unirest.cookie(cookie));
            });
        }
    },
    postEmail: function(isTest) {
        var url = isTest ?  'http://bl-test-server.com/post.php' : 'https://www.bricklink.com/contact.asp';
        var resource = unirest.post(url);
        resource
            .jar(this.CookieJar)
            .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.11; rv:44.0) Gecko/20100101 Firefox/44.0')
            .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
            .query({
                action: 'send'
            })
            .form({
                allmsgemail: 'brianpilati@gmail.com',
                p_body: 'boom',
                p_subject: 'test - 1',
                u: 'cedarsith',
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
            .end(function (response) {
                utils.writeToFile('postEmail', response.body);
            });
    },
    login: function(isTest) {
        var self = this;
        var url = isTest ?  'http://bl-test-server.com/post.php?function=login' : 'https://www.bricklink.com/login.asp';
        var resource = unirest.post(url);
        resource
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
            .end(function (response) {
                if (isTest) {
                    console.log(response.body);
                }
                self.addCookie(response);
                utils.writeToFile('login', response.body);
                self.postEmail(isTest);
            });
    }
}

var emailer = new BLEmailer();

if (false) {
    //emailer.addCookie(true);
    //emailer.postEmail(true);
    emailer.login(true);
} else {
    emailer.login();
}
