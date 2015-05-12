var mongoose = require('mongoose');

function historyPlugin(schema) {
      var updatedAt = 'updatedAt';
      var createdAt = 'createdAt';
      var deleted = 'deleted';
      var updatedBy = 'updatedBy';
      var updatedByType = {type: mongoose.Schema.Types.ObjectId, ref: 'User'};
      var updatedAtType = Date;
      var createdAtType = Date;
      var deletedType = Boolean;

      var dataObj = {};
      dataObj[updatedAt] = updatedAtType;
      dataObj[updatedBy] = updatedByType;
      dataObj[deleted] = deletedType;

      schema.post("update", function() {
            var object = this;
            if (object.constructor.name !== "HistoryModel") {
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
            }
        });

        schema.post('save', function() {
          var object = this;
          if (object.constructor.name !== "HistoryModel") {
            var history = new HistoryModel({
                action: "create",
                object: object,
                owner: (object.owner) ? object.owner : null
            });
            history.save(function(err, object) {
                if (err) {
                    console.log("Object Create History Save Failed:: "+err);
                }
            });
          }
          
        });

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
            this[updatedAt] = new Date;
          }
          next();
        });
      } else {
        dataObj[createdAt] = createdAtType;
        schema.add(dataObj);
        schema.pre('save', function (next) {
          if (!this[createdAt]) {
            this[createdAt] = this[updatedAt] = new Date;
            this[deleted] = false;
          } else if (this.isModified()) {
            this[updatedAt] = new Date;
          }
          next();
        });
      }

      if(!schema.methods.hasOwnProperty('touch'))
        schema.methods.touch = function(callback){
          this[updatedAt] = new Date;
          this.save(callback)
        }

}

module.exports.plugin = historyPlugin;

var HistoryModel = require('./history');
module.exports.historyModel = HistoryModel;
