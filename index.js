var mongoose = require('mongoose'),
    moment = require('moment'),
    captainHook  = require('captain-hook');

function historyPlugin(schema, addHistory) {
    if (addHistory == undefined) {addHistory = true;}
      var updatedAt = 'updatedAt';
      var createdAt = 'createdAt';
      var deleted = 'deleted';
      var updatedBy = 'updatedBy';
      var updatedByType = {type: mongoose.Schema.Types.ObjectId, ref: 'User'};
      var updatedAtType = String;
      var createdAtType = String;
      var deletedType = Boolean;

      var dataObj = {};
      dataObj[updatedAt] = updatedAtType;
      dataObj[updatedBy] = updatedByType;
      dataObj[deleted] = deletedType;

    if (addHistory) {

        schema.plugin(captainHook);

        var updateHappened = function(object, next) {

            console.log("updateHappened ", object._id);

            var action;

            if (object.deleted === true) {
                action = "Delete";
            } else {
                action = "Update";

                //HistoryModel.findOne({objectId: object._id}, {}, { sort: { 'updatedAt' : -1 } }, function(err, history) {
                //
                //    if (err) {
                //        console.log(err);
                //    }
                //
                //    console.log(history);
                //
                //    history.object = object;
                //    history.save(function(err, _history) {
                //        next();
                //    });
                //});
            }
            var history = new HistoryModel({
                action: action,
                object: object,
                owner: (object.owner) ? object.owner : null
            });
            history.save(function(err, _history) {
                next();
            });
        };

        var saveHappened = function(object, next) {

            console.log("saveHappened ", object._id);

            var action = "Create";

            var history = new HistoryModel({
                action: action,
                object: object,
                owner: (object.owner) ? object.owner : null
            });

            history.save(function(err, _history) {

                next();
            });
        };

        schema.postUpdate(updateHappened);

        schema.postCreate(saveHappened);

    }



      if (schema.path(createdAt)) {
        schema.add(dataObj);
        schema.virtual(createdAt)
          .get( function () {
            if (this["_" + createdAt]) return this["_" + createdAt];
            return this["_" + createdAt] = this._id.getTimestamp();
          });
        schema.pre('save', function (next) {
          if (this.isNew) {
            this[updatedAt] = this[createdAt];
          } else if (this.isModified()) {
            this[updatedAt] = new moment().format("X");
          }
          next();
        });
      } else {
        dataObj[createdAt] = createdAtType;
        schema.add(dataObj);
        schema.pre('save', function (next) {
          if (!this[createdAt]) {
            this[createdAt] = this[updatedAt] = new moment().format("X");
            this[deleted] = false;
          } else if (this.isModified()) {
            this[updatedAt] = new moment().format("X");
          }
          next();
        });
      }

      if(!schema.methods.hasOwnProperty('touch'))
        schema.methods.touch = function(callback){
          this[updatedAt] = new moment().format("X");
          this.save(callback)
        }

}

module.exports.plugin = historyPlugin;

var HistoryModel = require('./history');
module.exports.historyModel = HistoryModel;