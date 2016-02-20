'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  db.createTable('tweets', {
    id: { type: type.BIG_INTEGER, primaryKey: true, notNull: true },
    latitude: { type: type.REAL, notNull: true },
    longitude: { type: type.REAL, notNull: true },
    morton: { type: type.BIG_INTEGER, notNull: true}
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('tweets', callback);
};
