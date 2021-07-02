const {body, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Journal = require('../models/journal');
const async = require('async');
const {decryptAndEncryptAll} = require('./crypt_decrypt'); 



exports.get_user_info = (req, res, next) => {
	Journal.countDocuments({user: res.locals.currentUser._id})
	.exec((err, count) => {
		if (err)  { return next(err); }
		res.status(200).json({username:res.locals.currentUser.username, count: count});
		return;
	});
}

exports.change_password = [
	//validate and sanitise
	body('old_password', 'You must specify the old password.')
		.trim()
		.exists({ checkFalsy: true})
		.escape(),
	body('new_password', 'Password must be atleast eight characters.')
		.trim()
		.exists({ checkFalsy: true})
		.isLength({ min: 8 })
		.escape(),
	body('confirm_new_password', "Passwords don't match")
		.trim()
		.exists({ checkFalsy: true})
		.escape()
		.custom((value, {req}) => value === req.body.new_password),
	//process request
	(req, res, next) => {

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({message: errors.errors[0].msg});
	}	

	bcrypt.compare(req.body.old_password, res.locals.currentUser.password, (err, response) => {
		if (response) {
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(req.body.new_password, salt, (err, hashedpassword) => {
					
					if (err)  { return next(err); }

					Journal.find({user: res.locals.currentUser._id}, ('journal'))
							.exec((err, oldJournals) => {
								if (err) { return next(err); }

								const newEncryptedJournals = decryptAndEncryptAll(res.locals.currentUser.password, hashedpassword, oldJournals);
								if (!newEncryptedJournals) {
									return res.status(500).json({message:'Internal error. Try again'});
								}
								oldJournals.forEach((oldJournal, index) => {
									Journal.updateOne({"_id": oldJournal._id}, 
											{"$set":{"journal": newEncryptedJournals[index]}},
											(err) => {
												if (err) { return next(err); }
										})
								})
								 User.findByIdAndUpdate(res.locals.currentUser._id,
								 { $set: {password: hashedpassword} }, (err) => {
								 	if (err) { return next(err); }
								 })
								return res.status(200).json({message: 'Deleted'});
							})
					})
				})	
		} else {
			return res.status(400).json({message: 'The old password is incorrect.'});
		}
	})
}
]


exports.delete_account = (req, res, next) => {
	async.parallel({
		deleteUserAccount : function(callback){
			User.findByIdAndRemove(res.locals.currentUser._id, callback)
		},
		deleteUserJournals : function(callback) {
		   Journal.deleteMany({user: res.locals.currentUser._id}, callback)
		}
	}, (err) => {
		if (err)  { return next(err); }
		return res.status(200).json({message: 'Deleted'});
	})
}