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

app.post('/particle', function (req, res) {
    res.send('Particle');
});

/*************************************************************************/
// Interagir avec mon PHOTON
// Se logger


particle.login({
  username: 'virginie.mouries@wanadoo.fr', 
  password: 'virgi2109Particle'
}).then(
  function(data) {
    token = data.body.access_token;
    console.log('Je me logue');

    // Lister les devices présents
    var devicesPr = particle.listDevices({ auth: token });
	  console.log('Je récupère la liste des mes devices');   

    devicesPr.then(
      function(devices){
        console.log('Devices: ', devices);

        // devices = JSON.parse(devices);
        console.log(devices.body);
        devices.body.forEach(function(device){
          var toSave = new Devices(device);
              
          toSave.save(function(err, success){
            if(err){
              console.log(err);
            }
            else{
              console.log('device saved');
            }
          })
        });

      },
      function(err) {
        console.log('List devices call failed: ', err);
      }
    );

    console.log('Je liste les evenements de mon device');     
    particle.getEventStream({ deviceId: '1d002a001347343438323536', auth: token }).then(function(stream) {
      stream.on('event', function(data) {
        console.log("Event: " + JSON.stringify(data));

        var monEvent = new EventObj(data);
              
          monEvent.save(function(err, success){
            if(err){
              console.log(err);
            }
            else{
              console.log('device saved');
              io.sockets.emit('Photon', data);
            }
          })




        
        
      });
    });   

  },
  function (err) {
    console.log('Could not log in.', err);
  }
);

