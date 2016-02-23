var util = require('util');
var mysql = require('mysql');
var EventEmitter = require('events').EventEmitter;

function Cleaner(config, expiration) {
  EventEmitter.call(this);

  /** Default expiration: 1 day.*/
  this.expiration = expiration || 24 * 60 * 60;

  /** Connect to database. */
  this.conn = mysql.createConnection(config);
  this.conn.connect();
}

util.inherits(Cleaner, EventEmitter);
module.exports = Cleaner;

/**
 * Clean old rows from the database.
 */
Cleaner.prototype.clean = function(callback) {
  var sql = mysql.format(
    "DELETE FROM tweets WHERE created_at < ?",
    new Date(Date.now() - this.expiration * 1000)
  );

  this.emit('start', sql);

  this.conn.query(sql, (err, result) => {
    if (err) {
      this.emit('error', err);
    } else {
      this.emit('end', result.affectedRows);
    }

    callback(err, result.affectedRows);
  });
};

Cleaner.prototype.schedule = function(interval) {
  var that = this;

  /**
   * A function to be used as the callback for clean to schedule the
   * next clean.
   */
  function repeat(err) {
    if (err) {
      if (that.listenerCount('error') === 0) {
        throw err;
      } else {
        that.emit('error');
      }
    }

    setTimeout(
      /** The function to execute. */
      function(callback) {
        that.clean(callback);
      },
      /** The interval before the function is invoked. */
      interval * 1000,
      /** The argument for the function. In this case, it is recursive. */
      repeat
    );
  }

  /** Keep off the first clean. */
  process.nextTick(() => {
    this.clean(repeat);
  });
};

