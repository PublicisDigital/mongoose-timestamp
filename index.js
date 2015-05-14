var mongoose = require('mongoose'),
    moment = require('moment');

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
        schema.post("findOneAndUpdate", function() {
            var object = this._update;

            var action = "update";
            if(object.deleted) {
                action = "delete";
            }
            var history = new HistoryModel({
                action: action,
                object: object,
                owner: (object.owner) ? object.owner : null
            });
            history.save(function(err, object) {
                if (err) {
                    console.log("Object Update/Remove History Save Failed:: "+err);
                }
            });

            if (object.$push != undefined) {
                HistoryModel.findOneAndUpdate(
                    {objectId: this._conditions._id},
                    { $push:{ "object.comments": object.$push.comments}},
                    {safe: true, upsert: true},
                    function (err, history) {
                        console.log(err);
                    }
                );
            }

        });

        schema.post('save', function() {
            var object = this;
            var action = "create";
            if (object.createdAt != object.updatedAt) {
                action = "update";
            }
            var history = new HistoryModel({
                action: action,
                object: object,
                owner: (object.owner) ? object.owner : null
            });
            history.save(function(err, object) {
                if (err) {
                    console.log("Object Create History Save Failed:: "+err);
                }
            });
        });
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
            this[updatedAt] = new moment().format("x");
          }
          next();
        });
      } else {
        dataObj[createdAt] = createdAtType;
        schema.add(dataObj);
        schema.pre('save', function (next) {
          if (!this[createdAt]) {
            this[createdAt] = this[updatedAt] = new moment().format("x");
            this[deleted] = false;
          } else if (this.isModified()) {
            this[updatedAt] = new moment().format("x");
          }
          next();
        });
      }

      if(!schema.methods.hasOwnProperty('touch'))
        schema.methods.touch = function(callback){
          this[updatedAt] = new moment().format("x");
          this.save(callback)
        }

}

module.exports.plugin = historyPlugin;

var HistoryModel = require('./history');
module.exports.historyModel = HistoryModel;