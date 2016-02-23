var fs = require('fs');
var path = require('path');
var User = require('./User');

var Utils = function() {
    this.loadConfigurationFile()
};

Utils.prototype = {
    loadConfigurationFile: function() {
        this.configuration = JSON.parse(fs.readFileSync(path.resolve(this.getScriptPath(), 'config', 'config.js'), 'utf8'));
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
    writeToFile: function(file, body) {
        fs.writeFile(path.resolve(this.getScriptPath(), 'build',  file + '.html'), body, function(err) {
            if (err) {
                console.log('Error', err);
            }
            console.log("The file was saved!");
        });
    }

};

module.exports = new Utils();
