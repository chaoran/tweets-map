var util = require('util');
var mysql = require('mysql');
var finish = require('finish');
var Stream = require('stream').Writable;

function DbWriter(config) {
  if (!new.target) return new DbWriter(config);

  var conn = mysql.createConnection(config);
  conn.connect();
  var count = 0;

  function insertSingle (tweet, callback) {
    var sql = mysql.format('INSERT INTO tweets SET ?', tweet);
    conn.query(sql, function(err) {
      if (err && err.code === 'ER_DUP_ENTRY') {
        console.log("Ignored duplicate entry", tweet.id);
        callback(null);
      } else {
        count++;
        callback(err);
      }
    });
  }

  Stream.call(this, {
    highWaterMark: 100,
    objectMode: true,
    write: function(tweet, ignored, callback) {
      insertSingle(tweet, callback);
    },
    writev: function(tweets, callback) {
      tweets = tweets.map(chunk => tweet = chunk.chunk);

      var values = tweets.map(tweet => [
        tweet.id, tweet.latitude, tweet.longitude, tweet.morton
      ]);

      var sql = mysql.format(
        "INSERT INTO tweets (id, latitude, longitude, morton) VALUES ?",
        [ values ]
      );

      conn.query(sql, function(err) {
        if (err && err.code === 'ER_DUP_ENTRY') {
          finish.map(tweets, insertSingle, callback);
        } else {
          count += tweets.length;
          callback(err);
        }
      });
    }
  });

  this.on('finish', () => {
    conn.end((err) => {
      /**
       * TODO: Ideally, this error should give back to the callback
       * provided by DbWriter#end(). However, currently it is not
       * possible because the underlying stream does not pass callback
       * to me.
       * This should be fixed if the stream API provides a
       * writable#_flush interface.
       */
      if (err) throw err;
      this.emit('close', count);
    });
  });
};

util.inherits(DbWriter, Stream);
module.exports = DbWriter;
