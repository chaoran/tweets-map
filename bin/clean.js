var fs = require('fs');
var Cleaner = require('../lib/cleaner');

function clean(options) {
  options = options || {};
  options.expiration = options.expiration || 30;
  options.interval = options.interval || 5;

  var cleaner = new Cleaner(
    JSON.parse(fs.readFileSync('database.json', 'utf8')).dev,
    options.expiration
  );
  console.log(
    "Created a cleaner that keeps %d seconds tweets.",
    options.expiration
  );

  cleaner.schedule(options.interval);
  console.log(
    "Scheduled the cleaner to work every %d seconds.",
    options.interval
  );

  cleaner.on("start", function(sql) {
    console.log("[%s] cleaning...", new Date());
  });

  cleaner.on("end", function(nRows) {
    console.log("[%s] deleted %d rows", new Date(), nRows);
  });
}

/** Execute if this script is called directly. */
if (require.main == module) {
  clean();
}
/** Export the clean function if required. */
else {
  module.exports = clean;
}

