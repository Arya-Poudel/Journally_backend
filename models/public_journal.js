const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PublicJournalSchema = new Schema(
	{
		title:  { type:String, required: true},
		journal: {type: String, required: true},
		date: {type:Date, default: Date.now}
	}
)

module.exports =  mongoose.model('PublicJournal', PublicJournalSchema);