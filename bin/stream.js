var fs = require('fs');
var Twit = require('twit');

/**
 * Load Twitter API keys.
 */
var keysfile = fs.readFileSync("./keys.json", 'utf8');

/**
 * keysfile is a JSON file.
 * It looks like this:
 * {
 *   "consumer_key": ...,
 *   "consumer_secret": ...,
 *   "access_token": ...,
 *   "access_token_secret": ...
 * }
 */
var keys = JSON.parse(keysfile);

/**
 * Initialize streaming request.
 */
var twit = new Twit(keys);
var stream = twit.stream('statuses/filter', {
  locations: [ -180, -90, 180, 90 ]
});

/**
 * Count the number of tweets.
 */
var count = 0;

/**
 * Start timeing region.
 */
var time = Date.now();

stream.on('tweet', function(tweet) {
  var coords = tweet.coordinates;

  /**
   * tweet.coordinates may be null.
   */
  if (coords) {
    /**
     * tweet.coordiates = { "coordinates": [ ... ], "type": "Point" }.
     */
    coords = coords.coordinates;
  }
  else {
    /**
     * Find coordinates from tweet.place.bounding_box.coordinates.
     * bounding_box = { "coordinates": [ ... ], "type": "Polygon" }.
     * bounding_box.coordinates = [ [SW], [SE], [NE], [NW] ].
     * We only use the southwest and northeast corner of the box.
     */
    box = tweet.place.bounding_box.coordinates[0];
    coords = box[0].concat(box[2]);
  }

  var output = JSON.stringify({
    'id': tweet.id_str,
    'coordinates': coords
  });

  count++;
  console.log(output);
});

process.on('SIGINT', function() {
  /**
   * End timing region.
   */
  time = Date.now() - time;

  /**
   * Print total tweets received.
   */
  console.log("total: " + count + " tweets");

  /**
   * Print tweets received per second.
   */
  console.log("rate: " + count / (time / 1000) + " tweets / second");

  process.exit();
});

