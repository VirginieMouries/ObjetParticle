app.factory('listeFactory', ['$resource',
function($resource) {
	
	myDevices.getDevices = function(){
		console.log("Service");		
		return Devices.find();				
	};
	


	}
]);