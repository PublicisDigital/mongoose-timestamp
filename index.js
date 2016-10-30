var mongoose = require('mongoose'),
    moment = require('moment'),
    _ = require('lodash');

module.exports = function(schema) {
      var updatedAt = 'updatedAt';
      var createdAt = 'createdAt';
      var updatedAtType = String;
      var createdAtType = String;

      var dataObj = {};
      dataObj.updatedAt = updatedAtType;

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
          } else {
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
          } else {
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
