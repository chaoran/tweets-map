var Agent = require('twit');

function Stream(config) {
  if (!config) throw new Error("at least one argument is required");

  /**
   * Default endpoint and params.
   */
  var endpoint = config.endpoint || 'statuses/filter';
  var params = config.params || { locations: [ -180, -90, 180, 90 ] };

  /**
   * Initialize stream object.
   */
  var agent = new Agent(config);
  this._stream = agent.stream(endpoint, params);
}

Stream.prototype.on = function(event, callback) {
  if (event != 'tweet') {
    return this._stream.on(event, callback);
  }

  /**
   * Wraps the callback to strip the tweet to only id and coordinates.
   */
  return this._stream.on(event, function(tweet) {
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

    callback({ id: tweet.id_str, coordinates: coords });
  });
};

Stream.prototype.stop = function() {
  return this._stream.stop();
}

/**
 * Export the Stream class.
 */
module.exports = Stream;
