var User = function(userObject) {
    this.username = userObject.username;
    this.password = userObject.password;
}

User.prototype = {
    getUsername: function() {
        return this.username;
    },
    getPassword: function() {
        return this.password;
    }
}

module.exports = User;
