var fs = require('fs');
var path = require('path');
var User = require('./User');
var _ = require('lodash');

var Utils = function() {
    'use strict';
    this.loadConfigurationFile();
    this.debugLevel = 0;
};

Utils.prototype = (function() {
    'use strict';
    return {
        loadConfigurationFile: function() {
            this.configuration = JSON.parse(this.readFromFile(this.getFilePath(['config', 'config.js'])));
        },
        getUser: function() {
            return new User(this.configuration.user);
        },
        getScriptPath: function() {
            if (!this.scriptPath) {
                this.scriptPath = process.cwd();
            }
            return this.scriptPath;
        },
        readFromFile: function(file) {
            try {
                return fs.readFileSync(file, 'utf8');
            } catch(error) {
                this.debug('File Read Error');
                this.debug(error);
                return false;
            }
        },
        writeToFile: function(file, body) {
            var buildDirectory = this.getFilePath(['build']);
            var self = this;

            if (!fs.existsSync(buildDirectory)) {
                fs.mkdirSync(buildDirectory);
            }

            fs.writeFile(this.getFilePath([buildDirectory, file + '.html']), body, function(error) {
                if (error) {
                    self.debug('Write To File Error: ' + error);
                }
                self.debug('The "' + file + '" file was saved!');
            });
        },
        getFilePath: function(paths) {
            var filePath = this.getScriptPath();
            _.forEach(paths, function(localPath) {
                filePath = path.resolve(filePath, localPath);
            });

            return filePath;
        },
        setDebugLevel: function(level) {
            this.debugLevel = level;
        },
        debug: function(message, level) {
            level = level || 0;
            /* eslint-disable */
            if (level <= this.debugLevel) {
                console.log(message, '\n\n');
            }
            /* eslint-enable */
        },
        getEmailObject: function(directory) {
            return {
                emailBody: this.$$getEmailBody(directory),
                emailSubject: this.$$getEmailSubject(directory)
            };
        },
        $$getEmailBody: function(directory) {
            return this.readFromFile(this.getFilePath(['app', 'emailFiles', directory, 'emailBody.txt']));
        },
        $$getEmailSubject: function(directory) {
            return this.readFromFile(this.getFilePath(['app', 'emailFiles', directory, 'emailSubject.txt']));
        }
    };
})();

module.exports = new Utils();
