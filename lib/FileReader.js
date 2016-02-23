var fs = require('fs');
var util = require('util');
var Stream = require('stream').Transform;

function FileReader(filepath) {
  if (!new.target) return new FileReader(filepath);

  var leftChunk = '';

  Stream.call(this, {
    allowHalfOpen: false,
    readableObjectMode: true,
    decodeStrings: false,
    transform: function(chunk, encoding, callback) {
      if (leftChunk) chunk = leftChunk + chunk;

      var lines = chunk.split('\n');
      leftChunk = lines.pop();

      while (lines.length > 0) {
        var line = lines.shift();
        var tweet = parseTweet(line);
        this.push(tweet);
      }

      callback();
    },
    flush: function(callback) {
      if (leftChunk) {
        var line = (
          leftChunk[leftChunk.length - 1] === '\n' ?
            leftChunk.slice(0, -1) : leftChunk
        );

        var tweet = parseTweet(line);
        this.push(tweet);
      }

      this.push(null);
      callback();
    }
  });

  var file = fs.createReadStream(filepath, { encoding: 'utf8' });
  file.pipe(this);
};

function parseTweet(line) {
  var parts = line.split(',');
  var tweet = {
    id: parts[0],
    latitude: parseFloat(parts[1]),
    longitude: parseFloat(parts[2]),
    morton: parseInt(parts[3]),
    created_at: new Date(parts[4])
  };

  return tweet;
}

util.inherits(FileReader, Stream);
module.exports = FileReader;
