var express = require('express');
var userRouteProtected = express.Router();
var User = require('../schemas/Users');
var Event = require('../schemas/Events');
var _ = require('lodash');

// User's personal information ~
userRouteProtected.route("/")
	.get(function (req, res) {
		User.findById(req.user._doc._id)
			.populate("eventsCreated")
			.populate("eventsJoined")
			.exec(function (err, foundUser) {
				if (err) res.status(500).send(err);
				res.send(foundUser);
			});
	});

// User's events
userRouteProtected.route("/events")
	// GET all posted events ~ (check for populated fields)
	.get(function (req, res) {
		Event.find({
				owner: req.user._doc._id
			})
			.populate('organizer')
			.populate('attendees')
			.populate('comments.owner')
			.populate('comments.content')
			.exec(function (err, foundEvents) {
				if (err) res.status(500).send(err);
				res.send(foundEvents);
			});
	})
	// create new event ~
	.post(function (req, res) {
		User.findOne({
			_id: req.user._doc._id
		}, function (err, foundUser) {

			if (err) {
				res.status(500).send(err);
			} else {
				var newEvent = new Event(req.body);
				newEvent.owner = req.user._doc._id;
				newEvent.save(function (err, savedEvent) {
					if (err) {
						res.status(500).send(err);
					} else {
						foundUser.eventsCreated.push(savedEvent._id);
						foundUser.save(function (err, savedUser) {
							if (err) res.status(500).send(err);
							res.send(savedEvent);
						});
					}
				});
			}
		});
	});

userRouteProtected.route("/events/:eventId")
	// GET a single event by ID to api/user/events/:eventId ~ (check populated fields)
	.get(function (req, res) {
		Event.find({
				_id: req.params.eventId,
				owner: req.user._doc._id
			})
			.populate('organizer')
			.populate('attendees')
			.populate('comments.owner')
			.populate('comments.content')
			.exec(function (err, foundEvent) {
				if (err) res.status(500).send(err);
				res.send(foundEvent);
			});
	})
	// PUT an update on existing events api/user/events/:eventId with minimum object { name: "", description: "" } ~
	.put(function (req, res) {
		User.findById(req.user._doc._id, function (err, foundUser) {
			if (err) {
				res.status(500).send(err);
			} else {
				Event.findOneAndUpdate({
						_id: req.params.eventId,
						organizer: foundUser._id
					}, req.body, {
						new: true
					},
					function (err, updatedEvent) {
						if (err) {
							res.status(500).send(err);
						} else {
							var index = foundUser.eventsCreated.indexOf(req.params.eventId);
							if (index === -1) {
								res.status(500).send("User does not have the event listed.");
							} else {
								foundUser.eventsCreated.splice(index, 1, updatedEvent);
								foundUser.save(function (err, savedUser) {
									if (err) res.status(500).send(err);
									res.send(updatedEvent);
								});
							}
						}
					});
			}
		});

	})
	// DELETE a single event to api/user/events/:eventId ~
	.delete(function (req, res) {
		User.findById(req.user._doc._id, function (err, foundUser) {
			if (err) {
				res.status(500).send(err);
			} else {
				Event.findOneAndRemove({
					_id: req.params.eventId,
					organizer: req.user._doc._id
				}, function (err, deletedEvent) {
					if (err) {
						res.status(500).send(err);
					} else {
						_.remove(foundUser.eventsCreated, function (n) {
							return n === deletedEvent; //?
						});
						res.send(deletedEvent);
					}
				});
			}
		});
	});


module.exports = userRouteProtected;