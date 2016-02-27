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
        loadCSV: function(filename, callback) {
            var self = this;
            csv.fromPath(filename, {
                headers: true
            }).transform(function(data) {
                if (data.Buyer) {
                    if (self.duplicateUsers[data.Buyer]) {
                        self.duplicateUsers[data.Buyer].storePurchases++;
                    } else {
                        self.duplicateUsers[data.Buyer] = {
                            storePurchases: 1,
                            location: data.Location
                        };
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
        buildCSV: function(filename, includeNewClients, callback) {
            var self = this;

            var newClients = function(clients) {
                callback(clients);
            };

            var originalClients = function(clients) {
                if (includeNewClients) {
                    var filename = utils.getFilePath(['app', 'csvFiles', 'newClients.csv']);
                    self.loadCSV(filename, newClients);
                } else {
                    callback(clients);
                }
            };

            this.loadCSV(filename, originalClients);
        }
    };
})();

module.exports = new CSVParser();
