const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JournalSchema = new Schema(
	{
		title: {type:String, required: true},
		journal: {type:String, required: true},
		user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
		date: {type: Date, default: Date.now}
	}
)

module.exports = mongoose.model('Journal', JournalSchema);