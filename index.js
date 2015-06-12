var mongoose = require('mongoose'),
    moment = require('moment'),
    captainHook  = require('captain-hook'),
    _ = require('lodash'),
    HistoryModel;

function historyPlugin(schema, addHistory) {
    if (addHistory == undefined) {addHistory = true;}
      var updatedAt = 'updatedAt';
      var createdAt = 'createdAt';
      var updatedBy = 'updatedBy';
      var deleted = 'deleted';
      var published = 'deleted';
      var updatedAtType = String;
      var updatedByType = String;
      var createdAtType = String;
      var deletedType = Boolean;
      var publishedType = Boolean;

      var dataObj = {};
      dataObj.updatedAt = updatedAtType;
      dataObj.updatedBy = updatedByType;
      dataObj.deleted = deletedType;
      dataObj.published = publishedType;

    if (addHistory) {

        schema.plugin(captainHook);

        var updateHappened = function(object, next) {

            HistoryModel.find({objectId: object._id}, {}, {sort: {updatedAt: -1}})
                .limit(1)
                .exec(function(err, history) {
                if (err) {
                    console.log("Err:: ", err);
                }
                history = history[0];

                var blacklistedKeys = ["_id", "updatedAt", "updatedBy", "createdAt", "owner", "__v", "meta"];
                function onBlacklist(key) {
                    var blacklistedKey = false;
                    _.forEach(blacklistedKeys, function(k) {
                        if (k == key) {
                            blacklistedKey = true;
                        }
                    });
                    return blacklistedKey;
                }

                    var different = false;
                    if (history !== undefined) {

                        _.forIn(history.object, function(value, key) {

                            if (!onBlacklist(key)) {
                                console.log("CURRENT OBJECT:: KEY:: ", key, "VALUE:: ", object[key]);
                                console.log("NEW OBJECT:: KEY:: ", key, "VALUE:: ", value);
                                if (!_.isEqual(value, object[key]))  {
                                    console.log("FOUND DIFFERENCE FOR OBJECT/ARRAY");
                                    different = true;
                                }
                            }
                        });
                    } else {
                        different = true;
                    }


                if (different) {
                    var action;

                    if (object.deleted === true) {
                        action = "Delete";
                    } else {
                        action = "Update";
                    }
                    var newHistory = new HistoryModel({
                        action: action,
                        object: object,
                        owner: object.updatedBy
                    });
                    newHistory.save(function(err, __history) {
                        if (err) {
                            console.log(err);
                        }
                        next();
                    });
                } else {
                    next();
                }



            });
        };

        var saveHappened = function(object, next) {

            console.log("saveHappened ", object._id);

            var action = "Create";

            var history = new HistoryModel({
                action: action,
                object: object,
                owner: object.updatedBy
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
HistoryModel = require('./history');
module.exports.historyModel = HistoryModel;