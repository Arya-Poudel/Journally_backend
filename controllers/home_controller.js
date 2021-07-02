const bcrypt = require('bcryptjs');
const {body, validationResult} = require('express-validator');
const User = require('../models/user');

exports.home_page = (req, res , next) => {
	res.render('index');
};


exports.create_user = [
	//validate and sanitise
	body('username', 'You must specify an username')
		.trim()
		.exists({ checkFalsy: true})
		.escape(),
	body('password', 'Password must be atleast 8 characters.')
		.trim()
		.exists({ checkFalsy: true})
		.isLength({ min: 8 })
		.escape(),
	body('confirm_password', "The passwords don't match")
		.trim()
		.exists({ checkFalsy: true})
		.custom((value, {req}) => value === req.body.password)
		.escape(),

	//process request
	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({message: errors.errors[0].msg});
		}
		User.findOne({'username' : req.body.username}, (err, result) => {
			if (err)  { return next(err); }
			if (result) {
				return res.status(400).json({message:'Username already taken'});
			}
			else{
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(req.body.password, salt, (err, hashedpassword) => {
						if (err) { return next(err); }
						const newUser = new User({
							username: req.body.username,
							password: hashedpassword,
						})
						newUser.save(err => {
							if (err) {return next(err); }
							res.status(200).json({message:'Saved'});
							return;
						})
					})
				})
			}
		})

	}
]
