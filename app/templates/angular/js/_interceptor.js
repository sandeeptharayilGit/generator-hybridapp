<%= app_name %>.config(function ($provide, $httpProvider) {
'use strict';
 var $http;
 var element= angular.element('#loading');
  // Intercept http calls.
  $provide.factory('AppHttpInterceptor',['$q','$injector', function ($q,$injector) {
    var $rootScope,logger,
    showLoader=function (showloader){// generic method to show/hide the spinner
    
    if (showloader) {
      //element.fadeIn('fast','swing');
      element.show();
    }else{
    	element.hide();
      $rootScope.hideSpinner = false;
      }
  },
  getLogger=function (){
	  
	  if(!logger){
		  var loggerservice= $injector.get('loggerService');
		  logger= loggerservice('HttpInterceptor');
	  }
	  
	  return logger;
	  
	  
  };
    return {
      // On request success
      request: function (config) {
    	  if(angular.isString(config.ContentType)){
    		  config.headers['Content-Type'] = config.ContentType;
    		  config.transformRequest = function(data,headers) {
    			  return data === undefined?data:$.param(data);
    		  };
    	  }else if(config.headers['Content-Type'] && config.headers['Content-Type'] !=='application/xml'){
    		  config.headers['Content-Type'] = "application/json";
    		  config.transformRequest = function(data,headers) {
    			  return angular.toJson(data);
    		  };
    	  }else{
    		  config.transformRequest = function(data,headers) {
    			  return data;
    		  };
    	  }
    	  
    	  if(config && config.url && config.url.indexOf('.html')===-1){
    		  getLogger().log(config.url,config.data);
    	  }
    	  
        $rootScope = $rootScope || $injector.get('$rootScope');
        if(!$rootScope.hideSpinner){
            showLoader(true);
        }
        // Return the config or wrap it in a promise if blank.
        return config || $q.when(config);
      },
      // On request failure
      requestError: function (rejection) {
       // console.log('rejection',rejection);
        $rootScope = $rootScope || $injector.get('$rootScope');
        $http = $http || $injector.get('$http');
        if($http.pendingRequests.length < 1) {
            showLoader(false);
        }
        // Return the promise rejection.
        return $q.reject(rejection);
      },
 
      // On response success
      response: function (response) {
    	/*	if(angular.isDefined(response)&&  angular.isDefined(response.config)&& angular.isDefined(response.config.url) &&
    				response.config.url.indexOf('.html', response.config.url.length - '.html'.length)== -1){
    	        console.log('response',response);
    		}*/
        $rootScope = $rootScope || $injector.get('$rootScope');
        $http = $http || $injector.get('$http');
        if($http.pendingRequests.length < 1) {
            showLoader(false);
        }
        
        return response || $q.when(response);
      },
 
      // On response failture
      responseError: function (rejection) {
       //console.log('response Error : ',rejection);
       
        $rootScope = $rootScope || $injector.get('$rootScope');
        $http = $http || $injector.get('$http');
        if($http.pendingRequests.length < 1) {
            showLoader(false);
        }
        // Return the promise rejection.
        return $q.reject(rejection);
      }
    };
  }]);
 
  // Add the interceptor to the $httpProvider.
  $httpProvider.interceptors.push('AppHttpInterceptor');
  $httpProvider.defaults.timeout = 1000;
//  $httpProvider.defaults.headers.common["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";

//  $httpProvider.defaults.headers.post["Content-Type"] = "application/json";
/* 
  $httpProvider.defaults.transformRequest = function(data,headers) {
	  console.log("headers",headers());
	  return data === undefined?data:$.param(data);
  };*/
		
  //$httpProvider.defaults.cache=false;
 // $httpProvider.defaults.headers["cache-control"]="no-cache";
  //$httpProvider.defaults.headers.post["cache-control"]="no-cache";
});