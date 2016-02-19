var Transform = require('stream').Transform;
var morton = require('morton');

/**
 * Create a stream that transforms Twitter tweets to tweets with only
 * location information.
 * @returns [stream.Transform] a transform stream.
 */
module.exports = function parse() {
  return new Transform({
    objectMode: true,
    transform: function(tweet, ignored, next) {
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

      this.push({
        id: tweet.id_str,
        latitude: parseFloat(coords[1].toFixed(7)),
        longtitude: parseFloat(coords[0].toFixed(7)),
        morton: computeMortonOrder(coords[1], coords[0])
      });

      next();
    }
  });
};

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
