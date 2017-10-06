app.controller("listeCtrl", function($scope,$listeFactory) {

	console.log("listeCtrl");
	// je déclare un tableau dans le scope pour stocker mes infos
	$scope.socket = [];

	// récupèrer les données soit avec $http.get
	// soit faire factory
	$scope.device = listeFactory.getDevices();

	console.log($scope.device);

	socket.on("liste",function(socket){
        console.log(socket);
    
        $scope.socket.push(socket);        
        $scope.$apply();
    });
});