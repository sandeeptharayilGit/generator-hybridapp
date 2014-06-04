var qs = require('querystring');


var setLog = function(log) {

	switch (log.mode) {
	case 'trace':
		logger.trace(log.data);
		break;
	case 'debug':
		logger.debug(log.data);
		break;
	case 'info':
		logger.info(log.data);
		break;
	case 'warn':
		logger.warn(log.data);
		break;
	case 'error':
		logger.error(log.data);
		break;
	case 'fatal':
		logger.fatal(log.data);
		break;
	default:
		logger.info(log.data);
	}

}

module.exports = function(grunt) {
	grunt.initConfig({
	    distFolder : 'build',
	    srcFolder : 'app',
	    concat : {
		    app : {
		        src : [ '<%= srcFolder %>/scripts/*.js', '<%= srcFolder %>/scripts/**/*.js' ],
		        dest : '<%= distFolder %>/scripts/app.js'
		    }
	    },
	    ngmin : {
		    min : {
		        src : [ '<%= distFolder %>/scripts/app.js' ],
		        dest : '<%= distFolder %>/scripts/app.js'
		    }
	    },
	    cssmin : {
		    css : {
			    files : {
				    "build/styles/main.css" : [ "app/styles/*.css" ]
			    }
		    }
	    },
	    wiredep : {

		    target : {

		        // Point to the files that should be updated when
		        // you run `grunt wiredep`
		        src : [ 'build/index.html' // .html support..
		        ],

		        // Optional:
		        // ---------
		        cwd : '',
		        dependencies : true,
		        devDependencies : false,
		        exclude : [],
		        fileTypes : {},
		        ignorePath : '',
		        overrides : {}
		    }
	    },
	    copy : {
		    main : {
			    files : [ {
			        expand : true,
			        cwd : '<%= srcFolder %>/',
			        src : [ 'images/**', 'views/**', 'scripts/json/**', 'favicon.ico', 'index.html', 'scripts/config.json' ],
			        dest : '<%= distFolder %>/'
			    } ]
		    }
	    },
	    connect : {
	        server : {
		        options : {
		            keepalive : true,
		            open : true,
		            port : 9001,
		            base : 'build',
		            directory : 'build',
		            middleware : function() {
			            var middleware = [];
			            var log4js = require('log4js');
							log4js.configure('log4js_configuration.json', {});
						var logger = log4js.getLogger('appLogger');
							logger.setLevel('INFO');

			            middleware.push(function(req, res, next) {

				            console.log("Requesting... " + req.url);
				            if (req.url == "/") {
					            res.setHeader("Content-type", "text/html");
					            res.end(grunt.file.read("build/index.html"));
				            } else if (req.url == '/log') {
					            if (req.method == 'POST') {
						            var body = '';
						            req.on('data', function(data) {
							            body += data;
							            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
							            if (body.length > 1e6) {
								            // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
								            req.connection.destroy();
							            }
						            });
						            req.on('end', function() {

							            setLog(JSON.parse(qs.parse(body).message));

						            });
					            }
					            res.statusCode = 200;
					            res.end();
				            } else {
					            var urlArr = req.url.split('.')

					            if (urlArr[urlArr.length - 1] == 'css') {
						            res.setHeader("Content-type", "text/css");
					            } else if (urlArr[urlArr.length - 1] == 'html') {
						            res.setHeader("Content-type", "text/html");
					            } else if (urlArr[urlArr.length - 1] == 'js') {
						            res.setHeader("Content-type", "application/javascript");
					            }

					            res.end(grunt.file.read("build" + req.url));
				            }
				            // return next();

			            });

			            middleware.push(function(req, res) {
				            res.statusCode = 404;
				            res.end("Not Found");
			            });

			            return middleware;
		            }
		        }
	        },
	        generator : {
		        options : {
		            keepalive : true,
		            open : true,
		            port : 7777,
		            base : 'generator',
		            directory : 'generator'

		        }

	        }
	    },
	});

	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-wiredep');
	grunt.loadNpmTasks('grunt-ngmin');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('server', [ 'connect:server' ]);
	grunt.registerTask('generator', [ 'connect:generator' ]);
	grunt.registerTask('build', [ 'concat', 'ngmin', 'copy', 'cssmin', 'wiredep' ]);
	grunt.registerTask('default', [ 'build' ]);
};