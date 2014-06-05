var qs = require('querystring');
var fs = require('fs');
var generateApp = function(data) {
	console.log(data);
	fs.writeFile("generator/config.json", JSON.stringify(data, null, '\t'), function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("The config.json created!");
			var exec = require('child_process').exec, child;

			child = exec('yo hybridapp', function(error, stdout, stderr) {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (error !== null) {
					console.log('exec error: ' + error);
				}
			});
		}
	});
},
mountFolder = function(connect, dir) {
	return connect.static(require('path').resolve(dir));
},
mountGenerate = function(req, res, next) {

	console.log("Requesting... " + req.url);
	if (req.url !== '/generate') return next();

	if (req.method == 'POST') {
		var body = '';
		req.on('data', function(data) {
			body += data;
		});
		req.on('end', function() {
			generateApp(JSON.parse(body));
		});
	}
	res.statusCode = 200;
	res.end();
},
mountLogger = function(setLog) {
	return function(req, res, next) {
		console.log("Requesting... " + req.url);
		if (req.url !== '/log') return next();

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
	};
};

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
		        // Point to the files that should be updated when you run `grunt wiredep`
		        src : [ 'build/index.html'  ], // .html support..

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
		            middleware : function(connect, options) {
			            var log4js = require('log4js');
			            log4js.configure('log4js_configuration.json', {});
			            var logger = log4js.getLogger('appLogger');
			            logger.setLevel('INFO');
			            var setLog = function(log) {
				            switch (log.mode) {
				            case 'trace':logger.trace(log.data);break;
				            case 'debug':logger.debug(log.data);break;
				            case 'info':logger.info(log.data);break;
				            case 'warn':logger.warn(log.data);break;
				            case 'error':logger.error(log.data);break;
				            case 'fatal':logger.fatal(log.data);break;
				            default:logger.info(log.data);
				            }
			            };
			            return [ mountLogger(setLog), mountFolder(connect, options.base)];
		            }
		        }
	        },
	        generator : {
		        options : {
		            keepalive : true,
		            open : true,
		            port : 7777,
		            base : 'generator',
		            middleware : function(connect, options) {
			            return [ mountGenerate, mountFolder(connect, options.base)];
		            }
		        }
	        }
	    }
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
	grunt.registerTask('default', [ 'build','server' ]);
}