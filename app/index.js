'use strict';
var util = require('util'), path = require('path'), yeoman = require('yeoman-generator'), yosay = require('yosay'), chalk = require('chalk'), rimraf = require('rimraf'), fs = require('fs');
var framework = '';
var filePathArr = {
    html : "/htmls/",
    js : "/js/",
    css : "/css/",
    json : "/json/",
    gif : "/images/"
};
var isGeneratorReady = false,gruntfileExists=false;;

var getFilePath = function getFilePath(file) {
  var arr = file.split(".");
  return framework + (filePathArr.hasOwnProperty(arr[arr.length - 1]) ? filePathArr[arr[arr.length - 1]] : "/misc/") + file;
};

var HybridappGenerator = yeoman.generators.Base.extend({

    init : function() {
      this.pkg = require('../package.json');

      this.on('end', function() {

        this.installDependencies({
            skipInstall : this.options['skip-install'],
            callback : function() {
              // Emit a new event - dependencies installed
              this.emit('dependenciesInstalled');
            }.bind(this)
        });
      
      });

      // Now you can bind to the dependencies installed event
      this.on('dependenciesInstalled', function() {
           if (isGeneratorReady) {
                this.spawnCommand('grunt', [ 'build', 'server' ]);
            }else{
               this.spawnCommand('grunt', [ 'generator' ]);
            }
      });
    },

    askFor : function() {

      // Have Yeoman greet the user.
      this.log(yosay('Welcome to the marvelous Hybrid web application generator!'));
      try {
        if (fs.existsSync(path.join(process.cwd(), 'generator/config.json'))) {
          this.config = require(path.join(process.cwd(), 'generator/config.json'));
          isGeneratorReady=true;
         
          if(fs.existsSync(path.join(process.cwd(), 'Gruntfile.js'))){
              gruntfileExists=true;
          }

        } else {
            isGeneratorReady=false;

        }

      } catch (e) {
        console.log(e);
      }
      this.appName = (this.config.appName?this.config.appName:'').replace(/[^\w\d]/g,'');
      this.bootstrap = this.config.rwdFramework;
      this.framework = this.config.framework;
      framework = this.config.framework;
      this.defaultView = this.config.defaultView;
      this.views = this.config.views;
      this.proxy = this.config.proxy;
      this.context = {
          site_name : this.appName,
          proxy : this.proxy ? ',\n    "proxy": "' + this.proxy + '",\n    "https-proxy": "' + this.proxy + '",\n    "strict-ssl": false' : '',
          app_name : this._.camelize(this.appName) + 'App',
          defaultView_name : this.defaultView,
          view_name : this.defaultView,
          action : this.defaultView,
          actionUrl : this.defaultView + '/Action',
          actionMethod : "POST"
      };

    },
    generator:function(){
       if (!isGeneratorReady) {
        this.mkdir("generator");
        this.mkdir("generator/images");
        this.copy('common/_generator.html', 'generator/index.html');
        this.copy('common/_gruntfile.js', 'Gruntfile.js');
        this.copy('common/_bg.jpg', 'generator/images/bg.jpg');
        this.copy('common/_favicon.ico', 'generator/favicon.ico');
        this.copy('common/_angular.min.js', 'generator/angular.min.js');
        this.copy('common/_generator.js', 'generator/generator.js');
        this.copy('common/_bootstrap.min.css', 'generator/bootstrap.min.css');
        
        this.template("common/_package.json", "package.json", this.context);
      }
    },

    app : function() {
      if (isGeneratorReady) {
        this.mkdir("app");
        this.mkdir("app/styles");
        this.mkdir("app/scripts");
        this.mkdir("app/views");
        this.mkdir("app/scripts/controllers");
        this.mkdir("app/scripts/services");
        this.mkdir("app/scripts/directives");
        this.mkdir("app/scripts/filters");
        this.mkdir("app/images");
        this.mkdir("build");
        this.mkdir("tmp");
        this.mkdir("logs");
      }
    },

    templateFiles : function() {
      var done = this.async();
      if (isGeneratorReady) {
        this.template(getFilePath("_bower.json"), "bower.json", this.context);
        
        this.template(getFilePath("_log4js_configuration.json"), "log4js_configuration.json", this.context);
        this.copy(getFilePath("_app.json"), "logs/" + this.context.app_name + ".log");
        this.template(getFilePath('_.bowerrc'), '.bowerrc', this.context);

        this.template(getFilePath("_header.html"), "tmp/header.html", this.context);
        this.template(getFilePath("_body.html"), "tmp/body.html", this.context);

        this.template(getFilePath("_app.js"), "app/scripts/app.js", this.context);
        this.template(getFilePath("_errorHandler.js"), "app/scripts/services/errorHandler.js", this.context);
        this.template(getFilePath("_interceptor.js"), "app/scripts/services/interceptor.js", this.context);
        this.template(getFilePath("_commonServices.js"), "app/scripts/services/commonServices.js", this.context);
        this.template(getFilePath("_mainController.js"), "app/scripts/controllers/mainController.js", this.context);
        if(this.context.defaultView_name=='login'){
          this.template(getFilePath("_loginController.js"), "app/scripts/controllers/loginController.js", this.context);
          this.template(getFilePath("_login.html"), "app/views/login.html", this.context);
        }else{
          this.template(getFilePath("_Controller.js"), "app/scripts/controllers/" + this.context.view_name + "Controller.js", this.context);
          this.template(getFilePath("_view.html"), "app/views/" + this.context.view_name + ".html", this.context);
        }

      }
      done();
    },
    copyFiles : function() {
      if (isGeneratorReady) {
        if(!gruntfileExists)
          this.copy(getFilePath('_gruntfile.js'), 'Gruntfile.js');

        this.copy(getFilePath('editorconfig'), '.editorconfig');
        this.copy(getFilePath('favicon.ico'), 'app/favicon.ico');
        this.copy(getFilePath('jshintrc'), '.jshintrc');
        this.copy(getFilePath("_main.css"), "app/styles/main.css");
        this.copy(getFilePath("_loader.gif"), "app/images/loader.gif");
        this.copy(getFilePath("_footer.html"), "tmp/footer.html");
        this.template(getFilePath("_config.json"), "app/scripts/config.json", this.context);
      }
    },
    subgen : function() {
      if (isGeneratorReady) {
        this.log('calling subgenerator');
        this.invoke("hybridapp:view", {
          options : {
              views : this.views.join(),
              appName : this.appName,
              defaultView : this.defaultView,
              framework : this.framework
          }
        });
      }
    },

    concatFiles : function() {
      if (isGeneratorReady) {
        var done = this.async();

        var finalFile = '', partialFiles = [ "tmp/header.html", "tmp/body.html", "tmp/footer.html" ];

        for ( var i = 0; i < partialFiles.length; i++) {
          finalFile += this.readFileAsString(partialFiles[i]);
        }
        ;
        this.write('app/index.html', finalFile);
        var self = this;
        rimraf('tmp', function() {
          self.log.info('Removing temp directory');
          done();
        });
      }
    },

    runNpm : function() {
   
        var done = this.async();
        this.npmInstall("", function() {
          console.log("\nEverything Setup !!!\n");
          done();
        });
      
    }
});

module.exports = HybridappGenerator;
