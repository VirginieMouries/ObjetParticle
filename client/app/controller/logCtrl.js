app.controller("logCtrl", function($scope) {

	// je déclare un tableau dans le scope pour stocker mes infos
	$scope.socket = [];

	socket.on("Photon",function(socket){
        console.log(socket);
    
        $scope.socket.push(socket);        
        $scope.$apply();
    });
});