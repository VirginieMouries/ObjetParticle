var Particle = require('particle-api-js');
const express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Devices = require('./models/device.js');
var EventObj = require('./models/eventObj.js');
const app = express();
var serveur = require('http').createServer(app);
var io = require('socket.io')(serveur);
var particle = new Particle();
var token;
/*********************************************************************/
// j'instance la connection mongo 
var promise = mongoose.connect('mongodb://localhost:27017/ObjetsCo', {
    useMongoClient: true,
});
// quand la connection est réussie
promise.then(
    () => {
        console.log('db.connected');
        // je démarre mon serveur node sur le port 3000
        serveur.listen(3000, function() {
            console.log('Example app listening on port 3000!')
        });
    },
    err => {
        console.log('MONGO ERROR');
        console.log(err);
    }
);
// ecouter les evenements
 io.sockets.on('connection', function (socket) {
     console.log("un client est connecté");
     // console.log(socket);
     socket.emit('monsocket', { connexion: 'ok' });
});
// prends en charge les requetes du type ("Content-type", "application/x-www-form-urlencoded")
app.use(bodyParser.urlencoded({
    extended: true
}));
// prends en charge les requetes du type ("Content-type", "application/json")
app.use(bodyParser.json());
// je déclare mes fichiers statiques
app.use('/static', express.static('./client/app'));
/*********************************************************************/
// Le serveur express et ses routes

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
  // res.send('Hello World!')
});

// page d'accueil qui liste les evenements du device qui vient de se connecter 
// en faisant le lien avec Particle.io (la page est mise à jour dés que des 
// données sont enregistrées en BDD)
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
  // res.send('Hello World!')
});

// liste les évenements enregistrés dans la BDD
app.get('/event',function(req,res){
    EventsObj.find({},null,function(err,collection){
        if(err){
            console.log(err);
            return res.send(500);
        }else{
            // console.log(collection);
            res.send(collection);
        }
    });
});

// liste les devices enregistrés dans la BDD
app.get('/liste',function(req,res){
    Devices.find({},null,function(err,collection){
        if(err){
            console.log(err);
            return res.send(500);
        }else{
            // console.log(collection);
            res.send(JSON.stringify(collection));
        }
    });
});

// liste les infos d'un device particulier
app.get('/liste/:id', function(req,res){
    Devices.findOne({'_id':req.params.id},function(err,objet){
        if(err){
            console.log('Find Error' + err);
        }else {
            return res.send(objet);
        }
    });
});

// Renvoie un evenement: gestion de l'allumage et l'extinction de la lumière
app.post('/event', function(req,res){
    console.log("une requete est arrivée");
    var objet = {};
    // utilisation d'un fonction Particle
    var fnPr = particle.callFunction({ deviceId: myDevice, name: 'light', argument: 'hi', auth: token });
 
    fnPr.then(
        function(data) {
            console.log('Function called succesfully');
            var EventLight = {
                'device':myDevice,
                'data':data
            };
            io.emit('etatLight',EventLight);
        }, function(err) {
            console.log('An error occurred');
    });
});

// Pour la photo resistance - non utilisée
app.post('/liste', function(req,res){
    var myPhoto = particle.getVariable({ deviceId: myDevice, name: 'analogvalue', auth: token });
    
    myPhoto.then(
        function(data) {
            console.log('Device variable retrieved successfully:', data);
        }, 
        function(err) {
            console.log('An error occurred while getting attrs:', err);
    });
});







/*************************************************************************/
// Interagir avec mon PHOTON
// Se logger
particle.login({
  username: 'virginie.mouries@wanadoo.fr', 
  password: 'virgi2109Particle'
}).then(
  function(data) {
    // ticket de connexion ( necessaire à l'utiilisateur pour s'identifier )
    token = data.body.access_token;
    console.log('Je me logue');
    // Lister les devices présents avec authentification grâce au Token
    var devicesPr = particle.listDevices({ auth: token });
    console.log('Je récupère la liste des mes devices');   
    // la fontion devicePr renvoie une promesse avec la liste des Devices
    devicesPr.then(
      function(devices){
        console.log('Devices: ', devices);
        // devices = JSON.parse(devices);
        console.log("devices.body");
        console.log(devices.body);
        devices.body.forEach(function(device){
          console.log("device.id");
          console.log(device.id);
          // Récupèrer un Device particulier
          Devices.findOne({
            "id": device.id
          },
            function(err, monobject) {
              if (err) {
                console.log(err);
                return res.send(err);
              } else {
                console.log("Objet trouvé");
                console.log(monobject);
                if (monobject=== null){
                  var toSave = new Devices(device);
                  toSave.save(function(err, success){
                    if(err){
                      console.log(err);
                    }else{
                      console.log('device saved');
                    }
                  }); 
                }else{

                  monobject.last_heard = device.last_heard;
                  // update à remplacer par findByIdAndUpdate 
                  monobject.update({"last_heard":device.last_heard}, function(err, success){
                    if(err){
                      console.log(err);
                    }
                    else{
                      console.log('device updated');
                    }
                  });
                }
              }       
            }
          )
        }),
        function(err) {
            console.log('List devices call failed: ', err);
        }
      } 
    )
    // lister les evenements avec BeamStatus
    console.log('Je liste les evenements de mon device');     
    particle.getEventStream({ deviceId: '1d002a001347343438323536', auth: token }).then(function(stream) {
        stream.on('event', function(data) {
        console.log("Event: " + JSON.stringify(data));
        var monEvent = new EventObj(data);
                
        monEvent.save(function(err, success){
            if(err){
            console.log(err);
            }else{
            console.log('device saved');
            io.sockets.emit('Photon', data);
            }
        }); // monEvent
        }), // stream

        // lister les evenements fait avec Itensity
        particle.getEventStream({ deviceId: myDevice,name: 'Intensity', auth: token }).then(function(stream) {
            stream.on('event', function(data) {
                var toSave = new EventsObj(data);
                toSave.save(function(err,success){
                    if(err){
                        console.log('Add event Error ' + err);
                    }else{
                        console.log('Intensity Chart Value added');
                        io.emit('Intensity',success);
                    }
                });
              // console.log("Event: " + JSON.stringify(data));
            });
        }),
        function (err) {
            console.log('Could not log in.', err);
        }
    })
  }
)