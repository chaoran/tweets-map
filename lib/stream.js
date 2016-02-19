var Readable = require('stream').Readable;
var util = require('util');

const THRESHOLD = 8192;

function Stream(config, limit) {
  if (!config) throw new Error("at least one argument is required");

  /** Default endpoint and params. */
  const endpoint = config.endpoint || 'statuses/filter';
  const params = config.params || { locations: [ -180, -90, 180, 90 ] };

  Readable.call(this, { objectMode: true });

  /** Initialize stream object. */
  var twit = new require('twit')(config);

  this.stream = twit.stream(endpoint, params);
  this.started = true;

  var that = this;
  var count = 0;

  this.stream.on('tweet', function(tweet) {
    var stop = !that.push(tweet);
    count++;

    if (count >= limit) {
      that.push(null);
      stop = true;
    }

    if (stop) that.stream.stop();
  });
}

util.inherits(Stream, Readable);

Stream.prototype._read = function() {
  if (!this.started) this.stream.start();
};

module.exports = function(config, limit) {
  return new Stream(config, limit);
};
