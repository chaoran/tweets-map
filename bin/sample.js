var fs = require('fs');
var ApiReader = require('../lib/ApiReader');
var DbWriter = require('../lib/DbWriter');
var FileReader = require('../lib/FileReader');
var FileWriter = require('../lib/FileWriter');

/**
 * Take a number of sample tweets from Twitter and writes into a file.
 */
function sample(options, done) {
  var input_from_file = false
    , output_to_file = false;

  if (typeof options.input === 'string') {
    input_from_file = true;
  }

  if (typeof options.output === 'string') {
    output_to_file = true;
  }

  console.log(
    'Loading tweets from %s to %s...',
    input_from_file ? options.input : 'Twitter API',
    output_to_file ? options.output : options.output.database
  );

  /** Create input stream. */
  var input = (
    input_from_file ? FileReader(options.input) : ApiReader(options.input)
  );

  /** Create output stream. */
  var output = (
    output_to_file ? FileWriter(options.output) : DbWriter(options.output)
  );

  /** Start timeing region. */
  var time = Date.now();

  input.pipe(output);

  output.on('close', function(total) {
    /** End timeing region. */
    time = (Date.now() - time) / 1000;

    console.log(
      'Loaded %d tweets into %s (took %s seconds, %s tweets per second).',
      total,
      ( output_to_file ? options.output : options.output.database ),
      time.toFixed(2),
      (total / time).toFixed(2)
    );
  });
}

/**
 * Execute if this script is called directly.
 */
if (require.main == module) {
  var options = {
    input: JSON.parse(fs.readFileSync('keys.json', 'utf8')),
    output: JSON.parse(fs.readFileSync('database.json', 'utf8')).dev
  };

  options.input.limit = 1000;

  sample(options, function() {});
} else {
  module.exports = sample;
}

