module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'lib/**/*.js', 'bin/**/*.js', 'test/**/*.js'],
      options: {
        esversion: 6
      }
    },
    /**
     * Fetch a list of sample tweets from Twitter for development
     */
    sample: {
      options: {
        input: grunt.file.readJSON('keys.json'),
        output: grunt.file.readJSON('database.json').dev,
        limit: 65536
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask(
    'sample',
    'Fetch a list of tweets from Twitter',
    function() {
      var sample = require('./bin/sample');
      var options = this.options();
      var done = this.async();

      options.input.limit = options.limit;
      sample(options, done);
    }
  );

  grunt.registerTask('default', ['jshint']);
};

