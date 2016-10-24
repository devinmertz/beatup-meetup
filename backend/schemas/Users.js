var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var EventSchema = require('./Events').Schema;
//Token Auth
var bcrypt = require('bcrypt');

var userSchema = new Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	username: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	eventsCreated: [{
		type: Schema.Types.ObjectId,
		ref: 'Event'
	}],
	eventsJoined: [{
		type: Schema.Types.ObjectId,
		ref: 'Event'
	}],
	location: String,
	imgUrl: String

});

// Token Auth password hash
userSchema.pre("save", function (next) {
	var user = this;

	if (!user.isModified("password")) next();

	bcrypt.hash(user.password, 10, function (err, hash) {
		if (err) console.log(err);
		user.password = hash;
		next();
	});
});

userSchema.methods.comparePasswords = function (passwordAttempt, callback) {
	bcrypt.compare(passwordAttempt, this.password, function (err, isMatch) {
		if (err) callback(err);
		callback(null, isMatch);
	});
};

userSchema.methods.removePassword = function () {
	var user = this.toObject();
	delete user.password;
	return user;
};

module.exports = mongoose.model('User', UserSchema);