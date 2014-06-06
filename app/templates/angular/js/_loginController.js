
<%= app_name %>controllers.controller('<%= app_name %>-<%= view_name %>Cntrl',function <%= view_name %>Controller ( $scope, $rootScope, AppConstants,SelectView,SessionManager, $location,loggerService ) {
	"use strict";

	var log = loggerService('<%= app_name %>-<%= view_name %>Cntrl');
	log.log("Inside <%= app_name %>-<%= view_name %>Cntrl");

	$scope.username='';
	$scope.password='';

	$scope.signIn=function(){

	}
	
	$scope.cancel=function(){
		$scope.username='';
		$scope.password='';
		
	}
	

});

