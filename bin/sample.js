var fs = require('fs');
var Stream = require('../lib/stream');
var grunt = require('grunt');

/**
 * Take a number of sample tweets from Twitter and writes into a file.
 */
function sample(keypath, total, filepath, done) {
  /**
   * Load Twitter API keys from stdin. It looks like this:
   * {
   *   "consumer_key": ...,
   *   "consumer_secret": ...,
   *   "access_token": ...,
   *   "access_token_secret": ...
   * }
   */
  var keys = grunt.file.readJSON(keypath);

  /** Create tweet stream. */
  var stream = new Stream(keys);

  /** Create output file stream. */
  var output = fs.createWriteStream(filepath);

  console.log('Sampling %d tweets from Twitter...', total);

  /** Start timeing region. */
  var time = Date.now();
  var count = 0;

  stream.on('tweet', function(tweet) {
    var str = tweet.id + ' ' + tweet.coordinates.join(',') + '\n';
    output.write(str);

    if (++count >= total) {
      /** End timeing region. */
      time = Date.now() - time;
      rate = total * 1000 / time;

      stream.stop();
      output.end();

      console.log(
        'Completed in %d seconds (%d tweets per second).',
        time / 1000, rate.toFixed(2)
      );
      console.log(
        'Sampled tweets are saved in %s', filepath
      );
    }
  });
};

/**
 * Execute if this script is called directly.
 */
if (require.main == module) {
  var keys = process.argv[2] || 'keys.json';
  var total = process.argv[3] || 1000;
  var output = process.argv[4] || 'data/sample.txt';

  sample(keys, total, output, () => {});
} else {
  module.exports = sample;
}

