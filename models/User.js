// models/User.js
// This is an example of a User model using a simple object structure.
// If you were using an ORM, this would be defined using the ORM's syntax.

class User {
    constructor(userId, username, email, password, role, phoneNumber, dateOfBirth, sex, profilePictureUrl) {
      this.userId = userId;
      this.username = username;
      this.email = email;
      this.password = password;
      this.role = role;
      this.phoneNumber = phoneNumber;
      this.dateOfBirth = dateOfBirth;
      this.sex = sex;
      this.profilePictureUrl = profilePictureUrl;
    }
  }
  
  module.exports = User;
  