const express = require('express');
const bodyParser = require('body-parser');
const PlayersController = require('./app/controllers/PlayersController');
const path = require('path');

const port = 3001;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });

app.use(express.static(path.join(__dirname, "public")));
  
app.get('/', function(req, res) {
    res.sendFile('public/index.html');
});

PlayersController.registerRoutes(app);

app.listen(port, () => console.log(`API is listening on port ${ port }!`));
