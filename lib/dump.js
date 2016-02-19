var Writable = require('stream').Writable;
var fs = require('fs');

module.exports = function dump(filepath) {
  var output = fs.createWriteStream(filepath);

  var dumper = new Writable({
    objectMode: true,
    write: function(tweet, ignored, next) {
      var line = [
        tweet.id,
        tweet.latitude,
        tweet.longtitude,
        tweet.morton
      ].join(',');

      output.write(line + '\n', 'utf8', next);
    }
  });

  dumper.once('finish', function() {
    var that = this;
    output.end(function() { that.emit('close'); });
  });

  return dumper;
};
