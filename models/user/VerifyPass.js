const User = require("./user");
const GetUser = (username, password) =>
  User.findOne({ username: username }, (err, user) => {
    if (user) {
      user.comparePassword(password, (err, isMatch) => {
        if (isMatch) {
          return { error: null, user };
        } else if (err) {
          return { error: err, user: null };
        } else {
          return { error: new Error("not matching password"), user: null };
        }
      });
    } else if (err) {
      return { error: err, user: null };
    } else {
      return { error: new Error("No matching user"), user: null };
    }
  });

module.exports = GetUser;
