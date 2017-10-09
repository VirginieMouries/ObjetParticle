app.controller('deviceCtrl', function($scope,$routeParams,deviceFactory,deviceEventFactory){

	// $routeParams: la route (url) du client
	// la méthode renvoie un objet. Get recoit un objet
	$scope.myDevice = deviceFactory.get({deviceId:$routeParams.id});
	// besoin de traquer les évenements envoyé par le serveur
	var socket = io.connect();
	// tableau des devices event
	$scope.myDeviceEvent = [];
	// contiendra le device
	$scope.appareil = '';
	// gèrer l'allumage de la lampe
	$scope.switchLight = '';
	// forcer à rafraichir la vue
	$scope.load = true;

	// récupèrer l'ens des evenements enregistrés dans la bdd, c'est un tableau
	$scope.myDeviceEvent = deviceEventFactory.query();

	// traquer les evenements envoyé par le serveur par le io.emit
	socket.on('newEvent',function(data){
		// console.log(data);
		// mettre le nouvel événement en tête du tableau (inverse de push)
		$scope.myDeviceEvent.unshift(data);
		$scope.load = false;
		// utilisation d'une librairie externe socket.io 
		// mettre à jour le scope 
		$scope.$apply();
	});

	// quand on clique sur la lumière, executer la fonction ci-dessous
	// pas beau, à modifier
	$scope.light = function()
	{
		// Pas très propre
		// Création d'un deviceEvent -> crée un objet vide dans la bdd
		// écouter l'evenement
		// 
		deviceEventFactory.save();
		socket.on('etatLight',function(data){
			if(data.data.body.return_value == 0)
			{
				$scope.switchLight = 'Lampe allumée !';
			}
			else if(data.data.body.return_value == 1)
			{
				$scope.switchLight = 'Lampe éteinte !';
			}
			else
			{
				$scope.switchLight = 'Erreur';
			}
			
			$scope.appareil = data.device;
			$scope.$apply();
		});
	}

	// affichage d'un graphe avec l'intensité

	$scope.labels = [0];
	$scope.series = ['Intensity'];
	$scope.data = [0];

	$scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
	$scope.options = {
	scales: {
	  yAxes: [
	    {
	      id: 'y-axis-1',
	      type: 'linear',
	      display: true,
	      position: 'left'
	    }
	  ]
	}
	};

	socket.on('Intensity',function(data){
		// console.log(data.data);
		var last_elem = $scope.labels[$scope.labels.length-1];
		// modfier avec les infos contenues dans l'objet
		// $scope.labels.push(last_elem + 5);
		$scope.labels.push(data.published_at);
		$scope.data.push(data.data);
		$scope.$apply();
	});
});