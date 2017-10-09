app.factory('deviceFactory', function($resource){
// id Mongo
// resource est un méthode qui prend en paramètre une url et une varialble
// va sur la route /liste/id de mon serveur
	return $resource('http://localhost:3000/liste/:deviceId',{deviceId:'@id'},
	{
		// déclarer que l'on pourrait faire un put si on appelait 
		// la méthode update
		update:
		{
			method : 'PUT'
		}
	});
});