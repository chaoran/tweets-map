var Stream = require('stream').Readable;
var util = require('util');
var Api = require('twit');
var morton = require('morton');

function ApiReader(config, limit) {
  if (!new.target) return new ApiReader(config);

  /** Default endpoint and params. */
  const endpoint = config.endpoint || 'statuses/filter';
  const params = config.params || { locations: [ -180, -90, 180, 90 ] };

  /** Initialize stream object. */
  var api = new Api(config);
  var limit = config.limit;
  var count = 0;
  var started = false;

  Stream.call(this, {
    highWaterMark: 100,
    objectMode: true,
    read: function() {
      if (started) return;

      var stream = api.stream(endpoint, params);
      started = true;

      console.log("Connecting Twitter...");

      stream.on('disconnect', function(message) {
        console.log("Twitter disconnected.", message);
      });

      stream.once('connected', function() {
        console.log("Streaming %d tweets from twitter...", limit);
      });

      /** Start streaming. */
      stream.on('tweet', (tweet) => {
        var parsed = parse(tweet);
        this.push(parsed);

        /** Stop stream if our limit is reached. */
        if (++count == limit) {
          this.push(null);
          stream.stop();
        }
      });

      /** Throw any errors we may encounter. */
      stream.on('error', function(err) {
        throw err;
      });
    }
  });
}

util.inherits(ApiReader, Stream);
module.exports = ApiReader;

function parse(tweet) {
  var coords = tweet.coordinates;

  /** tweet.coordinates may be null. */
  if (coords) {
    /** tweet.coordiates = { "coordinates": [...], "type": "Point" }. */
    coords = coords.coordinates;
  } else {
    /**
     * Find coordinates from tweet.place.bounding_box.coordinates.
     * bounding_box = { "coordinates": [ ... ], "type": "Polygon" }.
     * bounding_box.coordinates = [ [SW], [SE], [NE], [NW] ].
     * We only use the southwest and northeast corner of the box.
     */
    var box = tweet.place.bounding_box.coordinates[0];

    coords = [
      box[0][2] === box[0][0] ? box[0][2] : (box[2][0] + box[0][0]) / 2,
      box[2][1] === box[0][1] ? box[2][1] : (box[2][1] + box[0][1]) / 2
    ];

    /** Handle the special case when the box spans across -180/180. */
    if (box[2][0] < box[0][0]) {
      if (coords[0] > 0) {
        coords[0] -= 180;
      } else {
        coords[0] += 180;
      }
    }
  }

  return {
    id: tweet.id_str,
    latitude: parseFloat(coords[1].toFixed(7)),
    longitude: parseFloat(coords[0].toFixed(7)),
    morton: computeMortonOrder(coords[1], coords[0])
  };
}

/**
 * Compute a Morton order for a geo point.
 * @param {number} lat The latitude;
 * @param {number} lng The longtude;
 * @return {string} The morton code.
 */
function computeMortonOrder(lat, lng) {
  const MULTIPLIER = 0xffffff / 360;

  /** Offset to make values positive. */
  lat = lat + 90;
  lng = lng + 180;

  /** Adjust ranges to [0, 0xffffff]. */
  lat = lat * MULTIPLIER;
  lng = lng * MULTIPLIER;

  /** Convert to 32-bit unsigned integers. */
  lat = lat >>> 0;
  lng = lng >>> 0;

  return morton(lat, lng);
}
