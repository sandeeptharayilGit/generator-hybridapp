angular.module('generator', []).controller('mainController', function mainController($scope, $rootScope, $http) {
	"use strict";
	$scope.error = false;
	$scope.errorMessage = "";
	$scope.errorClass = "alert-danger";
	$scope.page = 1;
	$scope.buttonName = 'Next';
	$scope.ConfigData={
		"appName" : "",
		"rwdFramework" : "",
		"framework" : "",
		"proxy" : "",
		"defaultView" : "login",
		"views" : [ "cart", "checkout" ],
		"utils": []
	};
	$scope.application = '';
	$scope.mvcFramework = '';
	$scope.rwdFramework = '';
	$scope.defaultView = '';
	$scope.views = [];
	$scope.frameworkList = [ {
		"text" : "Angular Js",
		"value" : "angular"
	}, {
		"text" : "BackBone",
		"value" : "backbone"
	} ];
	$scope.rwdList = [ {
		"text" : "Twitter Bootstrap 3.x",
		"value" : "bootstrap"
	}, {
		"text" : "Zurb Foundation 5",
		"value" : "foundation"
	} ];
	$scope.utilsList=[
	{name:"session",text:"Session Manager"},
	{name:"IScroll",text:"IScroll plugin"},
	{name:"GUIDGenerater",text:"GUID Generater"},
	{name:"Base64",text:"Base64 encryption/decryption"},
	{name:"logger",text:"Logger"}];


	$scope.populateUtils=function(){
		if(!$scope.ConfigData.utils){
			$scope.ConfigData.utils={};
		
		angular.forEach($scope.utilsList,function(value){

			if(angular.isUndefined($scope.ConfigData.utils[value.name]))
				$scope.ConfigData.utils[value.name]=false;
		});
		}
	}

	$http.get('/config.json').success(function(data, status) {
		$scope.ConfigData=data;
		$scope.populateUtils();
	
	}).error(function(){$scope.populateUtils});

	$scope.addView=function(){
		$scope.ConfigData.views.push('');
		$scope.ConfigData.views.push('');	
	};
	$scope.deleteView=function(index){
		$scope.ConfigData.views.splice((index),1);
	};



	$scope.buttonclick = function() {

		if ($scope.page == 1) {
			if ($scope.ConfigData.appName) {
				$scope.page++;
				$scope.buttonName = 'Generate';
				$scope.errorMessage = "";
				$scope.error = false;
			} else {
				$scope.errorClass = "alert-danger";
				$scope.errorMessage = "Please provide application name ";
				$scope.error = true;
			}
		} else if ($scope.page == 3) {
			$http.post('/generate',$scope.ConfigData).success(function() {
				$scope.error = true;
				$scope.errorClass = "alert-info";
				$scope.errorMessage=$scope.ConfigData.appName+'app generation is in progress.Please ensure that git is installed and env variables are set.'
			}).error(function(data, status, headers, config) {
				$scope.error = true;
				$scope.errorClass = "alert-danger";
				$scope.errorMessage=$scope.ConfigData.appName+"app generation failed. Please try again.";
				$scope.page = 1;
			});
		}else{
			$scope.page++;
		}

	}

}).run();
