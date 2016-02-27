var csv = require('fast-csv');
var _ = require('lodash');

var CSVParser = function() {
    'use strict';
};

CSVParser.prototype = (function() {
    'use strict';
    return {
        buildCSV: function(filename, callback) {
            var duplicateUsers = {};
            csv.fromPath(filename, {
                headers: true
            }).transform(function(data) {
                if (data.Buyer) {
                    if (duplicateUsers[data.Buyer]) {
                        duplicateUsers[data.Buyer].storePurchases++;
                    } else {
                        duplicateUsers[data.Buyer] = {
                            storePurchases: 1,
                            location: data.Location
                        };
                    }
                }
            }).on('end', function() {
                var users = [];
                _.forEach(duplicateUsers, function(details, username) {
                    users.push({
                        username: username,
                        storePurchases: details.storePurchases,
                        location: details.location,
                        emailed: false,
                        status: 0
                    });
                });
                callback(users);
            });
        }
    };
})();

module.exports = new CSVParser();
