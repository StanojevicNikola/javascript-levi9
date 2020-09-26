const express = require("express");
const bodyParser = require("body-parser");
const PlayersController = require("./app/controllers/PlayersController");
const path = require("path");
const expressEjsLayout = require("express-ejs-layouts");

const MongoDBService = require("./app/services/MongoDBService");
const mongoDBService = new MongoDBService("mongodb://localhost:27017", "levi9");

const port = 3001;
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.use(expressEjsLayout);

app.get("/leaderboard", async function (req, res) {
    await mongoDBService.connect();

    let users = await mongoDBService.find("players");
    mongoDBService.disconnect();

    users.sort((a, b) => {
        if (a.score > b.score) return 1;
        else return -1;
    });

    res.render("layout", { users });
});

app.get("/", function (req, res) {
    res.sendFile("public/index.html");
});

PlayersController.registerRoutes(app);

app.listen(port, () => console.log(`API is listening on port ${port}!`));
