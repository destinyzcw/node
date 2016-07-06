var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorite');
var Verify = require('./verify');

var app = express();

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(function(req, res, next) {
	Favorites.find({})
		.populate('postedBy', 'dishes')
		.exec(function(err, fav) {
			if(err) throw err;
			res.json(fav);
		});
})
.post(Verify.verifyOrdinaryUser, function(req, res, next) {

	req.body.postedBy = req.decoded._doc._id;

	Favorites.find({postedBy: req.body.postedBy}, function(err, fav) {
		if(err) throw err;

		console.log(fav);

		if(fav == "") {
			Favorites.create({postedBy: req.body.postedBy}, function(err, fav) {
				if(err) throw err;
				console.log("Favorite created!");
				console.log(fav);

				fav.dishes.push({_id: req.body._id});
				fav.save(function(err, fav) {
					if(err) throw err;
					console.log('Adding favorite dish!');
					console.log(fav);
					res.json(fav);
				});
			});
		}
		else {
			fav[0].dishes.push({_id: req.body._id});
			fav[0].save(function(err, fav) {
				if(err) throw err;
				console.log('Adding favorite dish!');
				console.log(fav);
				res.json(fav);
			});
		}

	});
})
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
	req.body.postedBy = req.decoded._doc._id;

	Favorites.remove({postedBy: req.body.postedBy}, function(err, resp) {
		if(err) throw err;
		res.json(resp);
	});
});

favoriteRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
	req.body.postedBy = req.decoded._doc._id;

	Favorites.find({postedBy: req.body.postedBy}, function(err, fav) {
		if(err) throw err;

		console.log(fav[0].dishes);

		// fav[0].dishes.id(req.params.dishId).remove();

		fav[0].dishes.remove({_id: req.params.dishId});

		fav[0].save(function(err, resp){
			if(err) throw err;
			res.json(resp);
		});

	});
});

module.exports = favoriteRouter;

