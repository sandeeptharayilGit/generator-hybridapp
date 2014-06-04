'use strict';
var loggerModule = angular.module('logger', []);
loggerModule.value('ServiceUrl','http://localhost:9001/log'); // provide service url
/**
 * Service that gives us a nice Angular-esque wrapper around the
 * stackTrace.js pintStackTrace() method. 
 */
loggerModule.factory("stackTrace",function(){
	return({
		getTrace: printStackTrace
	});
});


loggerModule.service("remoteLogger",function(ServiceUrl){
	return{
		pushToServer: function(data){
			$.ajax({
				type: "POST",
				url: ServiceUrl, 
				contentType: "application/json",
				data: {
					message:data
				}
			});
		}
	};
});



/**
 * Exception Logging Service, currently only used by the $exceptionHandler
 * it preserves the default behaviour ( logging to the console) but 
 * also posts the error server side after generating a stacktrace.
 */
loggerModule.factory("remoteExceptionLoggingService",["$log","$window", "stackTrace","remoteLogger",
                                                       function($log, $window, stackTrace,remoteLogger){
	function error(exception, cause){

		// preserve the default behaviour which will log the error
		// to the console, and allow the application to continue running.
		$log.error.apply($log, arguments);

		// now try to log the error to the server side.
		try{
			var errorMessage = exception.toString();
			
			// use our traceService to generate a stack trace
			var stackTrace = stackTrace.getTrace({e: exception});
			var errorData=angular.toJson({
				url: $window.location.href,
				message: errorMessage,
				type: "exception",
				stackTrace: stackTrace,
				cause: ( cause || "")
			});
			
			
			remoteLogger.pushToServer(errorData);
		} catch (loggingError){
			$log.warn("Error server-side logging failed");
			$log.log(loggingError);
		}
	}
	return(error);
}]);

/**
 * Override Angular's built in exception handler, and tell it to 
 * use our new exceptionLoggingService which is defined below
 */
loggerModule.provider("$exceptionHandler",{
	$get: function(remoteExceptionLoggingService){
		return(remoteExceptionLoggingService);
	}
});



loggerModule.factory('loggerService', function ($log, $rootScope,remoteLogger) {  
	'use strict';
	  return function (prefix) {                            
	    return {
	      info: extracted('info'),
	      log:  extracted('log'),                           
	      warn: extracted('warn'),                          
	      error:extracted('error'),                          
	      fatal:extracted('fatal'),
	    };                                                 
	    function extracted(prop) {                          
	        return function () {                            
	          var args = [].slice.call(arguments);  
	        
	          if (prefix) {
             try{
		            args.unshift(' [' + prefix + '] - ');
		            remoteLogger.pushToServer(angular.toJson({mode:prop,data:args.join()} ));

		            args.unshift(new Date().toLocaleTimeString());
		            // appending date and class name
		           
		            $log[prop].apply($log, args);
		        }catch(e){}
	              
          		}                                             
	         
	         
	        };                                               
	    }                                                   
	  };                                                     
	});
