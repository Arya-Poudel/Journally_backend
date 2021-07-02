const {body, validationResult} = require('express-validator');
const Journal = require('../models/journal');
const {encrypt, decrypt} = require('./crypt_decrypt'); 


exports.get_private_journals = (req, res , next) => {
	Journal.find({user: res.locals.currentUser._id},('title date'))
	.exec((err, journals) => {
		if (err)  { return next(err); }
		res.status(200).json(journals);
	})
};


exports.get_journal_info = (req, res, next) => {
	Journal.findById(req.params.id)
	.exec((err, journalInfo) => {
		if (err)  { return next(err); }
		const decryptResult = decrypt(res.locals.currentUser.password, journalInfo.journal);
		if (!decryptResult) {
		    return res.status(500).json({message:'Internal error. Try again'});
		}
		journalInfo.journal = decryptResult;
		res.status(200).json(journalInfo);
	})
}


exports.delete_journal = (req, res, next) => {
	Journal.findByIdAndRemove(req.params.id, (err) => {
		if (err)  { return next(err); }
		return res.status(200).json({message:'Deleted'});
	})
}


exports.create_private_journal = [
	//validate and sanitise
	body('title', 'Title must exist').trim().exists({ checkFalsy: true}).escape(),
	body('journal', 'Journal must exist').trim().exists({ checkFalsy: true}).escape(),
	//process request
	(req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({message: errors.errors[0].msg});
		}	

		const encryptResult = encrypt(res.locals.currentUser.password, req.body.journal);
		if (!encryptResult) {
		    return res.status(500).json({message:'Internal error. Try again'});
		}

	    const newJournal = new Journal({
			title: req.body.title,
			journal: encryptResult,
			user: res.locals.currentUser._id
		})
		
		newJournal.save(err => {
			if (err)  { return next(err); } 
			res.status(200).json({message:'Saved', journal: newJournal});
			return;
		})
	}
]


exports.update_journal = [
	//validate and sanitise
	body('title', 'Title must exist').trim().exists({ checkFalsy: true}).escape(),
	body('journal', 'Journal must exist').trim().exists({ checkFalsy: true}).escape(),
	//process request
	(req, res, next) => {

		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({message: errors.errors[0].msg});
		}	

		const encryptResult = encrypt(res.locals.currentUser.password, req.body.journal);
		if (!encryptResult) {
		    return res.status(500).json({message:'Internal error. Try again'});
		}
	
		const editedJournal = new Journal({
			_id: req.params.id,
			title: req.body.title,
			journal: encryptResult,
			user: res.locals.currentUser._id
		})
		
		Journal.findByIdAndUpdate(req.params.id, editedJournal, {}, (err, editedjournal) => {
			if (err)  { return next(err); }
			res.status(200).json({message:'Updated'});
			return;
		})
	}
]