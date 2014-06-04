document.addEventListener('touchmove', function(e){
	"use strict";
	e.preventDefault();
});

<%= app_name %>controllers.controller('<%= app_name %>-mainCntrl',function mainController ( $scope, $rootScope, AppConstants,SelectView,SessionManager, $location,loggerService ) {
	"use strict";

	var log = loggerService('<%= app_name %>-cartCntrl');

	log.log("Inside <%= app_name %>-mainCntrl");




});

