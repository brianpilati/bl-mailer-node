var User = function(userObject) {
    'use strict';
    this.username = userObject.username;
    this.password = userObject.password;
};

User.prototype = (function() {
    'use strict';
    return {
        getUsername: function() {
            return this.username;
        },
        getPassword: function() {
            return this.password;
        }
    };
})();

module.exports = User;
