commonSrv.factory('appResource',function appResource($resource, $rootScope) {
	'use strict';
	$rootScope.hideSpinner = false;
	var slice = function(a) {
		return Array.prototype.slice.call(a);
	};
	return function() {
		var wrapper = {}, 
		resource = $resource.apply($resource(),	slice(arguments)),
		createProps = function(key,	res) {
			return function() {
				var args = slice(arguments);

				if (Object.prototype.toString
						.apply(args[args.length - 1]) === "[object Boolean]") {
					$rootScope.hideSpinner = args.pop();
				}
				return res[key].apply(res, args);
			};
		};
		for ( var k in resource) {
			if (resource.hasOwnProperty(k)) {
				wrapper[k] = createProps(k, resource);
			}
		}
		//console.dir(wrapper);
		return wrapper;
	};
});

commonSrv.factory('SessionManager',function SessionManager($log,$rootScope){
	'use strict';
	$log.info("inside SessionManager");
	var AssociateDetails='AssociateDetails';
	// alert(AssosiateDetails);
	return{     
		initSession:function(user){
			//$log.info("inside SessionManager->initSession");

			if(sessionStorage){                  
				sessionStorage.setItem(AssociateDetails,(user));  
				$rootScope.headerVars.isLoggedIn=true;
			}                       
		},   
		clearSession:function(){
			//$log.info("inside SessionManager->clearSession");
			$rootScope.headerVars.isLoggedIn=false;
			$rootScope.balanceAmount = 0;
			$rootScope.amountPaidUsingCreditCard = 0;
		    $rootScope.SYWRRedemption = false;
			$rootScope.showCartIcon = true;
			$rootScope.headerVars.paymentFlow = false;
			if(sessionStorage){                  
				sessionStorage.clear();                        
			}                        
		},
		getSessionData:function(key){
			//$log.info("inside SessionManager->getSessionData");
			if(sessionStorage){                  
				return (sessionStorage.getItem(key));                
			}
		},
		removeSessionData:function(key){
			//$log.info("inside SessionManager->getSessionData");
			if(sessionStorage){                  
				return (sessionStorage.removeItem(key));                
			}
		},
		setSessionData:function(key,value){
			//$log.info("inside SessionManager->getSessionData");
			if(sessionStorage){ 
				sessionStorage.setItem(key,(typeof value ==='object')?angular.toJson(value):value);                
			}
		},
		isLoggedIn:function(){
			//$log.info("inside SessionManager->isLoggedIn");
			if(sessionStorage){                  
				return (angular.isDefined(sessionStorage.getItem(AssociateDetails)) &&
						sessionStorage.getItem(AssociateDetails) !==null );                
			}
			else{
				return false;
			}
		}
	};
});

commonSrv.factory('MessageBox',function MessageBox( $rootScope,Messages) {
	'use strict';
	return {
		show : function(message,title){
			$rootScope.setMessage(message,title);
			$rootScope.showMessageBox();
		},
		confirmBox : function(message,callback){
			$rootScope.setMessage(message);
			$rootScope.showConfirmBox(callback);
		},
		messages:Messages
	};
});

commonSrv.service('SelectView',function SelectView(loggerService,$location){
	'use strict';
	
	var log=loggerService('SelectView');
//	alert('selectView');
	return{     
		gotoLogin:function(){
			log.info("inside gotoLogin");
			$location.url('/login');
		},
		gotoView:function(view){
			log.info("opening  url: /",view);
			$location.url('/'+view);
		},
		gotoViewWithParams:function(view,args){

			var url='/'+view;
			for(var i=0;i<args.length;i++){
				url=url+'/'+args[i]; 
			}
			log.info("opening  url: ",url);
			$location.url(url);
		}
	};
});

commonSrv.service('IScroll',function IScroll($timeout,$log,$location){
	'use strict';

	return{     
		scroll : function(delay){
			$timeout(this.createIScroll,delay?delay:200);
		},
		createIScroll : function(){

			self.iscr = new iScroll('wrapperid', {
				hideScrollbar: false,
				useTransition: true
			});

		}
	};
});


commonSrv.service('GUIDGenerater',function GUIDGenerater(){
	"use strict";
	var UID=function() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
	};

	return{     
		getUID:function(){
			return (UID() + UID() + "-" + UID() + "-4" + UID().substr(0,3) + "-" + UID() + "-" + UID() + UID() + UID()).toLowerCase();
		}
	};
});
commonSrv.service('Base64',['$window',function Base64($window){
	"use strict";
	return{     
		encode:function(data){
			return $window.btoa(data);
		},
		decode:function(data){
			return $window.atob(data);
		}
	};
}]);


commonSrv.factory('ServiceFactory',['$log','appResource','ApiConstants',function ServiceFactory(logger,resource,ApiConstants){
	'use strict';
	logger.info("inside ToggleFooter");

	var getServiceData=function(serviceName){
		var data={};	

		if(ApiConstants.API_DETAILS.hasOwnProperty(serviceName) ){
			data=angular.copy(ApiConstants.API_DETAILS[serviceName]);
		}

		data.url=ApiConstants.BASE_URL+data.url;

		return data;
	};
	var getServiceUrl=function(serviceName){
		return getServiceData(serviceName).url;
	};
	return{     
		postService:function(serviceName){

			var apiData= getServiceData(serviceName);
			var postObj = {
					method: apiData.method,
					isArray: false				
			};
			if(angular.isString(apiData.ContentType)){
				postObj.ContentType = apiData.ContentType;
			}
			return resource(apiData.url, {}, {
				post: postObj
			});
		},
		getService:function(serviceName){
			return resource(getServiceUrl(serviceName), {}, {});
		},
		getServiceUrl:function(serviceName){
			return getServiceUrl(serviceName);
		},
		getExternalServiceUrl:function(serviceName){
			return ApiConstants[serviceName];
		}

	};
}]);


/*commonSrv.service('remoteLogger',['ServiceFactory',function remoteLogger(ServiceFactory){
	"use strict";
	return{     
		log:function(messageData){
			ServiceFactory.postService('logger').post({"message":messageData});
		}

	};
}]);*/
