var express = require('express');
var eventRoute = express.Router();
var User = require('../schemas/Users');
var Event = require('../schemas/Events');

// This route is for unprotected event postings

// GET all posted eventss
eventRoute.route("/")
    .get(function (req, res) {
        Event.find({}, function (err, events) {
            if (err) res.status(500).send(err);
            res.send(events);
        });
    });

// GET a single posted event by id
eventRoute.route("/:eventId")
    .get(function (req, res) {
        Event.findById(req.params._id, function (err, foundEvent) {
            if (err) res.status(500).send(err);
            res.send(foundEvent);
        });
    });

// GET events by name
eventRoute.route("/name")
    .get(function (req, res) {
        Event.find({
                name: req.query.name
            })
            .populate("organizer")
            .populate("attendees")
            .exec(function (err, foundEvents) {
                if (err) res.status(500).send(err);
                res.send(foundEvents);
            });
    });

// GET all events within a specific region
eventRoute.route("/region/:regionId")
    .get(function (req, res) {
        Event.find({
                region: req.params.regionId
            })
            .populate('organizer')
            .exec(function (err, events) {
                if (err) res.status(500).send(err);
                res.send(events);
            });
    });

module.exports = eventRoute;