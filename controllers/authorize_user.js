const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const {body, validationResult} = require('express-validator');


const authorize_user = [
	//validate and sanitise
	body('username', 'Username must exist')
		.trim()
		.exists({ checkFalsy: true})
		.escape(),
	body('password', 'Password must exist')
		.trim()
		.exists({ checkFalsy: true})
		.escape(),
	//process request
	(req, res, next) => {
	User.findOne({ username : req.body.username}, (err, user) => {
		if (err) { 	return next(err); }
		if (!user) {
			return res.status(401).json({message:"The username and passwords don't match. Please try again."});
		}
		bcrypt.compare(req.body.password, user.password, (err, response) => {
			if (response) {
				jwt.sign({user}, 'thesecretkey', {expiresIn: '1 day'}, (err, token) => {
					if (err) { return next(err); }
					// res.locals.currentPassword = req.body.password;
					res.status(200).json({message:'Welcome', token: token});
					return;
				})
			} else{
				return res.status(401).json({message: "The username and passwords don't match. Please try again."});
			}
		})
	})
  }
]

module.exports = authorize_user;