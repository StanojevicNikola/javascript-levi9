const util = require('util');
const MongoDBService = require('../services/MongoDBService');

class PlayersController {
  constructor(request, response) {
    this.request = request;
    this.response = response;

    this.mongoDBService = new MongoDBService('mongodb://localhost:27017',
      'levi9');
  }

  static registerRoutes(app) {

    app.get('/players', (request, response) => {
      new PlayersController(request, response).getPlayers();
    });

    app.get('/players/:id', (request, response) => {
      new PlayersController(request, response).getPlayer();
    });


    app.put('/players', (request, response) => {
      new PlayersController(request, response).insertPlayer();
    });

    app.delete('/players/:id', (request, response) => {
      new PlayersController(request, response).deletePlayer();
    });
  }

  async getPlayers() {
    await this.mongoDBService.connect();

    let Players = await this.mongoDBService.find('players');

    this.mongoDBService.disconnect();
    this.response.send(Players);
  }

  async getPlayer() {
    await this.mongoDBService.connect();

    let Player = await this.mongoDBService.find('players', { name: parseInt(this.request.params.name) });

    this.mongoDBService.disconnect();
    this.response.send(Player);
  }

  async insertPlayer() {

    await this.mongoDBService.connect();

    await this.mongoDBService.insert('players',  {
      name: this.request.body.name,
      score: this.request.body.score
    });

    this.mongoDBService.disconnect();
    this.response.send('Success');
  }


  async deletePlayer() {
    await this.mongoDBService.connect();

    await this.mongoDBService.delete('players', { name: parseInt(this.request.params.name) } );

    this.mongoDBService.disconnect();
    this.response.send('Success');
  }
}

module.exports = PlayersController;