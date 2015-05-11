var HistoryModel = require('./history');

function historyPlugin(schema) {
  var updatedAt = 'updatedAt';
  var createdAt = 'createdAt';
  var deleted = 'deleted';
  var updatedAtType = Date;
  var createdAtType = Date;
  var deletedType = Boolean;

  var dataObj = {};
  dataObj[updatedAt] = updatedAtType;

  schema.post("update", function() {
        var object = this;
        var action = "update";
        if(object.deleted) {
            action = "delete";
        }
        var history = new HistoryModel({
            action: action,
            object: object
        });
        history.save(function(err, object) {
            if (err) {
                console.log("Object Update/Remove History Save Failed:: "+err);
            }
        });
    });

    schema.post('save', function() {
      var object = this;
      var history = new HistoryModel({
            action: "create",
            object: object
        });
        history.save(function(err, object) {
            if (err) {
                console.log("Object Create History Save Failed:: "+err);
            }
        });
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
    dataObj[deleted] = deletedType;
    schema.add(dataObj);
    schema.pre('save', function (next) {
      if (!this[createdAt]) {
        this[createdAt] = this[updatedAt] = new Date;
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

module.exports = timestampsPlugin;
