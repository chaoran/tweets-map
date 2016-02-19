var fs = require('fs');
var grunt = require('grunt');

var stream = require('../lib/stream');
var parse = require('../lib/parse');
var dump = require('../lib/dump');

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

  /** Create tweets stream. */
  var input = stream(keys, total);

  /** Create parse stream. */
  var parser = parse();

  /** Create dump stream. */
  var output = dump(filepath);

  console.log('Sampling %d tweets from Twitter...', total);

  /** Start timeing region. */
  var time = Date.now();

  input.pipe(parser).pipe(output);

  output.on('close', function() {
    /** End timeing region. */
    time = Date.now() - time;
    rate = total * 1000 / time;

    console.log(
      'Completed in %d seconds (%d tweets per second).',
      time / 1000, rate.toFixed(2)
    );
    console.log(
      'Sampled tweets are saved in %s', filepath
    );
  });
}

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

