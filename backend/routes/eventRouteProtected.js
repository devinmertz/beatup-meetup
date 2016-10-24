var express = require('express');
var itemRouteProtected = express.Router();
var User = require('../schemas/Users');
var Event = require('../schemas/Events');

// This route is for accessing user-specific data

eventRouteProtected.route("/")
	// GET all events posted by a user
	.get(function (req, res) {
		Event.find({
			organizer: req.user._id
		}, function (err, events) {
			if (err) res.status(500).send(err);
			res.send(events);
		});
	})
	// POST a new event listing
	.post(function (req, res) {
		var newEvent = new Event(req.body);
		newEvent.save(function (err, savedEvent) {
			if (err) res.status(500).send(err);
			res.send(savedEvent);
		});
	});

eventRouteProtected.route("/:eventId")
	// GET one event posting and populate relevant data
	.get(function (req, res) {
		Event.findOne({
				_id: req.params.eventId,
				organizer: req.user._id
			})
			.populate('comments.content')
			.populate('comments.owner')
			.populate('attendees')
			.exec(function (err, foundEvent) {
				if (err) res.status(500).send(err);
				res.send(foundEvent);
			});
	})
	// PUT an event posting
	
	.put(function (req, res) {
		console.log(req.body);
		Event.findOneAndUpdate({
				_id: req.params.eventId,
				organizer: req.body.organizer
			}, req.body, {
				new: true
			},
			function (err, updatedEvent) {
				if (err) res.status(500).send(err);
				res.send(updatedEvent);
			});
	})
	// DELETE an event posting
	.delete(function (req, res) {
		Event.findOneAndRemove({
			_id: req.params.eventId,
			organizer: req.user._id
		}, function (err, deletedEvent) {
			if (err) res.status(500).send(err);
			res.send(deletedEvent);
		});
	});

// POST a new comment to the item's comments array
// send POST to (baseUrl + /api/event/comment/:commentId
// :eventId will be the _id corresponding to the event collection
// the comments.owner will be added in this endpoint from the req.user._id
eventRouteProtected.route("/comment/:eventId")
	.post(function (req, res) {
		Event.findOne({
			_id: req.params.eventId
		}, function (err, foundEvent) {
			if (err) {
				res.status(500).send(err);
			} else {
				//req.body.owner = req._doc._id;
				foundEvent.comments.push(req.body);
				foundEvent.save(function (err, savedEvent) {
					if (err) res.status(500).send(err);
					res.send(savedEvent);
				});
			}
		});
	});

// adding yourself as an attendee to an event
eventRouteProtected.route("/attendee/:eventId")
	.post(function (req, res) {
		Event.findOne({
			_id: req.params.eventId
		}, function (err, foundEvent) {
			if (err) {
				res.status(500).send(err);
			} else {
				//req.body.owner = req._doc._id;
				foundEvent.attendees.push(req.body);
				foundEvent.save(function (err, savedEvent) {
					if (err) res.status(500).send(err);
					res.send(savedEvent);
				});
			}
		});
	});


module.exports = eventRouteProtected;