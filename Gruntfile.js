module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        eslint: {
           target: getESLintFiles() 
        },
        clean: {
            build: ['build']
        },
        jsbeautifier: {
            fix: {
                src: getActiveFiles(),
                options: {
                    mode: "VERIFY_AND_WRITE",
                    config: "./.jsbeautifyrc"
                }
            },
            verify: {
                src: getActiveFiles(),
                options: {
                    mode: "VERIFY",
                    config: "./.jsbeautifyrc"
                }
            }
        },
        watch: {
            eslint: {
                files: getESLintFiles(),
                tasks: ['eslint']
            },
            jsbeautify: {
                files: getActiveFiles(),
                tasks: ['jsbeautify:fix']
            }
        }
    });

    /* Tasks */
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['build-setup']);
    grunt.registerTask('build-setup', ['clean:build', 'lint']);

    /* watch */
    grunt.registerTask('eslint-auto', ['watch:eslint']);

    /* linters */
    grunt.registerTask('lint', ['eslint', 'jsbeautify:verify']);

    grunt.registerTask('jsbeautify', ['jsbeautifier:fix']);
    grunt.registerTask('jsbeautify-auto', ['watch:jsbeaufity']);
    grunt.registerTask('jsbeautify-check', ['jsbeautifier:verify']);

    /* Node Modules */
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-jsbeautifier');

    function getESLintFiles() {
        var activeFiles = getActiveFiles();
        if (grunt.option('grep')) {
            var returnFiles = [];
            activeFiles.forEach(function(file) {
                returnFiles.push((file.replace(/\*\.js/, '')) + ('*' + grunt.option('grep') + '*'));
            });
            return returnFiles;
        } else {
            return activeFiles;
        }
    }

    function getActiveFiles() {
        return [
            './app/**/*.js'
        ];
    }
};
