/**
 * History model used to keep track of page/module/whatever changes
 */

var mongoose = require('mongoose'),
    history = require('mongoose-history').plugin,
    deepPopulate = require('mongoose-deep-populate');

var HistoryModel = function() {

    var schema = mongoose.Schema({
        action: {type: String, enum: ["create", "update", "delete"], required: true},
        object: {type: Object, required: true},
        objectId: String,
        owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    });

    schema.plugin(history, false);
    schema.plugin(deepPopulate);

    schema.pre("save", function(next) {
        this.objectId = this.object._id;
        next();
    });

    return mongoose.model('History', schema);
};

module.exports = new HistoryModel();