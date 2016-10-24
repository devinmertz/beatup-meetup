var express = require('express');
var authRoute = express.Router();
var jwt = require('jsonwebtoken');
var config = require('../config');
var User = require('../schemas/Users');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

authRoute.post("/signup", function (req, res) {
	var newUser = new User(req.body);
	newUser.save(function (err, savedUser) {

		if (err) res.status(500).send(err);
		res.send(savedUser);
	});
});

authRoute.post("/login", function (req, res) {

	User.findOne({
			username: req.body.username
		})
		.populate("eventsCreated")
		.populate("eventsJoined")
		.exec(function (err, foundUser) {
			if (err) res.status(500).send(err);
			if (!foundUser) {
				res.status(401).send({
					success: false,
					message: 'Username does not exist. Please create an account.'
				});
			} else if (foundUser) {
				bcrypt.compare(foundUser.password, req.body.password, function (err, isMatch) {

					foundUser.comparePasswords(req.body.password, function (err, isMatch) {

						if (!isMatch) {

							res.status(401).send({
								success: false,
								message: 'Incorrect password'
							});
						} else {
							var token = jwt.sign(foundUser, config.secret, {
								expiresIn: "24h"
							});
							res.send({
								success: true,
								token: token,
								user: foundUser.removePassword(),
								message: "Here is your token!"
							});
						}

					});
				});
			}
		});
});

module.exports = authRoute;