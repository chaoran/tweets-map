module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['Gruntfile.js', 'lib/**/*.js', 'bin/**/*.js', 'test/**/*.js']
    }
  });


  grunt.loadNpmTasks('grunt-contrib-jshint');
};
