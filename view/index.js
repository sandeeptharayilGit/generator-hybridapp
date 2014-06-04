'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var rimraf = require('rimraf');
var util = require('util');
var fs = require('fs');
var framework = '';

var filePathArr = {
    html : "/htmls/",
    js : "/js/",
    css : "/css/",
    json : "/json/",
    gif : "/images/"
};
var chalk = require('chalk');
var getRoute = function(context) {
  return {
      "settings" : {
          "templateUrl" : "views/" + context.view_name + ".html",
          "controller" : context.app_name + "-" + context.view_name + "Cntrl"
      },
      "config" : {
          "header" : "",
          "bodyColor" : "gray"
      }
  };
};
var getFilePath = function getFilePath(file) {

  var arr = file.split(".");

  var filePath = filePathArr.hasOwnProperty(arr[arr.length - 1]) ? filePathArr[arr[arr.length - 1]] : "/misc/";

  return framework + filePath + file;

};

var ViewGenerator = module.exports = function ViewGenerator(args, options, config) {
  var that = this;
  yeoman.generators.Base.apply(this, arguments);

  // in this.options we have the object passed to 'invoke' in app/index.js:
  this.appName = that.options.appName;
  this.views = that.options.views;
  this.defaultView = that.options.defaultView;
  this.framework=that.options.framework;

};

util.inherits(ViewGenerator, yeoman.generators.Base);

ViewGenerator.prototype.init = function init() {
  console.log('The view subgenerator called for the view(s) ' + this.views + '.');
  
  this.on('end', function() {
    this.log();
    this.log();
    this.log(chalk.green.bold('Html and conntroller created for the view(s) : ' + (this.name || this.views)));
    this.log(chalk.green.bold('Updated routes in config.json for the app ' + this.context.app_name));
    this.log();
    this.log(chalk.cyan.bgRed.bold('Take a grunt build and run your app'));

  });

};

ViewGenerator.prototype.files = function files() {
  var done = this.async();
   framework=this.framework;
  var packageObj = {};
  if (!this.appName) {
    packageObj = this.readFileAsString('package.json');
    packageObj = JSON.parse(packageObj);
  }

  var configObj = this.readFileAsString('app/scripts/config.json');
  configObj = JSON.parse(configObj);

  this.context = {
      app_name : (this.appName || packageObj.name) + 'App',
      view_name : this.name
  };
  var viewArr = (this.name || this.views).split(',');
  for ( var i = 0; i < viewArr.length; i++) {
    this.context.view_name = viewArr[i];

    configObj.Global.Routes['/' + this.context.view_name] = getRoute(this.context);
    this.template(getFilePath("_Controller.js"), "app/scripts/controllers/" + this.context.view_name + "Controller.js", this.context);
    this.template(getFilePath("_view.html"), "app/views/" + this.context.view_name + ".html", this.context);

  }
  ;
  var self = this;
  rimraf('app/scripts/config.json', function() {
    self.write('app/scripts/config.json', JSON.stringify(configObj, null, '\t'));
    self.log.info('Updating config.json');
    done();
  });

};
