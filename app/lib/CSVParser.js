var csv = require('fast-csv');
var _ = require('lodash');
var utils = require('./Utils');

var CSVParser = function() {
    'use strict';
    this.duplicateUsers = {};
};

CSVParser.prototype = (function() {
    'use strict';
    return {
        loadCSV: function(filename, loadOptions, callback) {
            var self = this;
            function addClient(client) {
                if (self.duplicateUsers[client.Buyer]) {
                    self.duplicateUsers[client.Buyer].storePurchases++;
                } else {
                    self.duplicateUsers[client.Buyer] = {
                        storePurchases: 1,
                        location: client.Location
                    };
                }
            }

            csv.fromPath(filename, {
                headers: true
            }).transform(function(data) {
                if (data.Buyer) {
                    if (loadOptions.usaOnlyClients) {
                        if (data.Location.match(/USA.*/)) {
                            addClient(data);
                        }
                    } else if (loadOptions.internationalOnlyClients) {
                        if (! data.Location.match(/USA.*/)) {
                            addClient(data);
                        }
                    } else {
                        addClient(data);
                    }
                }
            }).on('end', function() {
                var clients = [];
                _.forEach(self.duplicateUsers, function(details, username) {
                    clients.push({
                        username: username,
                        storePurchases: details.storePurchases,
                        location: details.location,
                        emailed: false,
                        status: 0
                    });
                });
                callback(clients);
            });
        },
        buildCSV: function(buildOptions) {
            var self = this;

            var newClients = function(clients) {
                buildOptions.callback(clients);
            };

            var originalClients = function(clients) {
                if (buildOptions.includeNewClients) {
                    var filename = utils.getFilePath(['app', 'csvFiles', 'newClients.csv']);
                    self.loadCSV(filename, buildOptions, newClients);
                } else {
                    buildOptions.callback(clients);
                }
            };

            this.loadCSV(buildOptions.filePath, buildOptions, originalClients);
        }
    };
})();

module.exports = new CSVParser();
