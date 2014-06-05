angular.module('generator', []).controller('mainController', function mainController($scope, $rootScope, $http) {
	"use strict";
	$scope.error = false;
	$scope.page = 1;
	$scope.buttonName = 'Next';
	$scope.ConfigData={
			    "appName" : "",
			    "rwdFramework" : "",
			    "framework" : "",
			    "proxy" : "",
			    "defaultView" : "login",
			    "views" : [ "cart", "checkout" ]
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


	$http.get('/config.json').success(function(data, status) {
		$scope.ConfigData=data;
	});

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
				$scope.errorMessage = "Please provide application name ";
				$scope.error = true;
			}
		} else if ($scope.page == 2) {
			$http.post('/generate',$scope.ConfigData).error(function(data, status, headers, config) {
				alert('failed. Please try again');
				$scope.page = 1;
			});
		}

	}

}).run();
