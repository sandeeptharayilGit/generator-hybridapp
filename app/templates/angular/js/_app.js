var <%= app_name %> = angular.module("<%= app_name %>", [ 'ngRoute', 'ngSanitize', 'ngTouch','ngResource','ngAnimate','<%= app_name %>-application','logger']);
var <%= app_name %>Constants=angular.module('<%= app_name %>-constants', []);
var commonSrv = angular.module('<%= app_name %>-commons', []);
var <%= app_name %>controllers = angular.module('<%= app_name %>-controllers', []);
var <%= app_name %>directives = angular.module('<%= app_name %>-directives', []);
var <%= app_name %>services = angular.module('<%= app_name %>-services', []);
var <%= app_name %>filters = angular.module('<%= app_name %>-filters', []);
var <%= app_name %>Global={};
angular.module('<%= app_name %>-application', [ '<%= app_name %>-commons', '<%= app_name %>-controllers','<%= app_name %>-directives', '<%= app_name %>-services',
                                          '<%= app_name %>-constants','<%= app_name %>-filters']);

//setting all urls from the <%= app_name %>Global.Routes (config.json)
<%= app_name %>.config(['$routeProvider', function routeProvider($routeProvider) {
	'use strict';
	var views=<%= app_name %>Global.Routes;
	for (var viewKey in views) {
		if (views.hasOwnProperty(viewKey)) {
			switch (viewKey) {
			case 'otherwise':
				$routeProvider.otherwise(views[viewKey]);
				break;
			default:
				$routeProvider.when(viewKey, (views[viewKey]).settings);
			break;
			}
		}
	}
}]);

<%= app_name %>.run(['$rootScope','SessionManager','SelectView','loggerService',
               function <%= app_name %>Run($rootScope, SessionManager, SelectView,loggerService) {
	'use strict';

	$rootScope.hideSpinner = false;
	$rootScope.locations = [];
	//$rootScope.loggerQueue = FixedQueue( 100, [ "<%= app_name %> started"] );
	$rootScope.currentView='';
	$rootScope.pageTitle='';
	$rootScope.bodyColour="gray";
	
	var log=loggerService('rootscope');
	// Logout function is available in any pages
	$rootScope.logout = function() {
		//log.log("inside logout");
		SessionManager.clearSession();
		SelectView.gotoLogin();
	};

	$rootScope.logs = function(){
		$('.logs_container').toggleClass('open',500);
	};

	/*$rootScope.clearLogs = function(){
		$rootScope.loggerQueue = FixedQueue( 100, [ "Log cleared"] );
	};


	$rootScope.setlog = function(loggerMsg) {
		if($rootScope.headerVars.LoggerOn)
			$rootScope.loggerQueue.add(loggerMsg);
	};*/

	$rootScope.$on('$routeChangeSuccess', function routeChangeSuccess($event, current) {

		if(current&& current.originalPath&& current.originalPath.length>0 &&
				current.originalPath!==$rootScope.currentView){

			$rootScope.currentView=current.originalPath;
			//log.log("current url",$rootScope.currentView);
			var peripheralArray=[];
			if(<%= app_name %>Global.Routes.hasOwnProperty($rootScope.currentView) && (<%= app_name %>Global.Routes[$rootScope.currentView]).config){

				var pageConfig=<%= app_name %>Global.Routes[$rootScope.currentView].config;

				$rootScope.pageTitle=(pageConfig.header)?pageConfig.header:'';
				$rootScope.bodyColour=(pageConfig.bodyColor)?pageConfig.bodyColor:'gray';
				

				
			} 
			
		}
	});

} ]);



/**  Bootstrapping angular app after loading connfig.json file**/


$(function () {
	'use strict';
	$.ajax({
		url: "scripts/config.json",
		type:"GET",
	}).done(function startup(configData) {

		try{
			var data=angular.fromJson(configData);
			var Config=data.Common;//add all common properties first.
			// Set your constant provider
			if(Config){
				for(var commonkey in Config){
					if(Config.hasOwnProperty(commonkey)){
						<%= app_name %>Constants.value(commonkey, Config[commonkey]);
					}
				}
			}
			if(data.Global){
				Config=data.Global;
				if(Config){
					for(var envkey in Config){
						if(Config.hasOwnProperty(envkey)){
							<%= app_name %>Global[envkey]= Config[envkey];
						}
					}
				} 
			}
			var debug=false;
			if(data.Env){
				Config=debug?(data.Env.debug):(data.Env.app);
				if(Config){
					for(var envkey in Config){
						if(Config.hasOwnProperty(envkey)){
							<%= app_name %>Constants.value(envkey, Config[envkey]);
						}
					}
				}
			}
		}
		catch(e){
			throw new Error("[<%= app_name %>-constants] - Configuration not found");
		}


		// Bootstraping angular app
		angular.bootstrap(document, ['<%= app_name %>']);

	});
});



