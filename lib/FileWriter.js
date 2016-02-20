var fs = require('fs');
var util = require('util');
var Stream = require('stream').Transform;

function FileWriter(filepath) {
  if (!new.target) return new FileWriter(filepath);

  var count = 0;

  Stream.call(this, {
    writableObjectMode: true,
    transform: function(tweet, ignored, callback) {
      var line = [
        tweet.id,
        tweet.latitude,
        tweet.longitude,
        tweet.morton
      ].join(',');

      count++;
      this.push(line + '\n');
      callback();
    }
  });

  var file = fs.createWriteStream(filepath, { defaultEncoding: 'utf8' });
  this.pipe(file);

  file.on('finish', () => {
    this.emit('close', count);
  });
}

util.inherits(FileWriter, Stream);
module.exports = FileWriter;
