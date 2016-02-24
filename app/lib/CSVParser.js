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
                if (duplicateUsers[data.Buyer]) {
                    duplicateUsers[data.Buyer]++;
                } else {
                    duplicateUsers[data.Buyer] = 1;
                }
            }).on('end', function() {
                var users = [];
                _.forEach(duplicateUsers, function(purchaseCount, username) {
                    users.push({
                        username: username,
                        storePurchases: purchaseCount,
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
