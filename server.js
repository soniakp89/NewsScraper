var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// public a folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/3000";

mongoose.connect(MONGODB_URI);

// Routes

app.get("/scrape", function(req, res) {

  axios.get("http://www.wsj.com/news").then(function(response) {

    var $ = cheerio.load(response.data);

    // grabbing article headline
    $("h3").each(function(i, element) {
      
      var result = {};

      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      db.Article.create(result)
        .then(function(dbArticle) {
          // dded result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
    
          console.log(err);
        });
    });

    // message to the client
    res.send("Scrape Completed!!!");
  });
});

// Route for Articles from the db
app.get("/articles", function(req, res) {
  
    db.Article.find()
      
      .then(function(dbPopulate) {
       
        res.json(dbPopulate);
      })
      .catch(function(err) {
    
        res.json(err);
      });
});

// Route for grabbing an Article
app.get("/articles/:id", function(req, res) {
 
  db.Article.findById(req.params.id)
  .populate("note")
  .then(function(dbPopulate) {
    res.json(dbPopulate);
  })
  .catch(function(err) {
    res.json(err);
  });
});

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbPopulate) {
      
      return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: { note: dbPopulate._id } }, { new: true });
    })
    .then(function(dbPopulate) {
     
      res.json(dbPopulate);
    })
    .catch(function(err) {
    
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});