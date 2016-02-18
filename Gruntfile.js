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
        keys: 'keys.json',
        total: 65536,
        output: 'data/sample.txt'
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
      sample(options.keys, options.total, options.output, done);
    }
  );

  grunt.registerTask('default', ['jshint']);
};

