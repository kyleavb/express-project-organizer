var express = require('express');
var db = require('../models');
var router = express.Router();
var async = require('async');

// POST /projects - create a new project
router.post('/', function(req, res) {
  var categories = [];
  if(req.body.category){
    categories = req.body.category.split(",");
  }
  db.project.create({
    name: req.body.name,
    githubLink: req.body.githubLink,
    deployedLink: req.body.deployedLink,
    description: req.body.description
  })
  .then(function(project){
    if(categories.length > 0){
      async.forEach(categories, function(c, callback){
        db.category.findOrCreate({
          where: {name: c.trim()}
        }).spread(function(newCat, wasCreated){
          project.addCategory(newCat).then(function(){
            callback();
          });
        });
      });
    }//end of if statement
    res.redirect('/');
  })
  .catch(function(error) {
    res.status(400).render('main/404');
  });
});

//GET project/edit
router.get('/edit/:id', function(req, res){
  db.project.find({
    where: { id: req.params.id },
    include: [db.category]
  })
  .then(function(project) {
    if (!project) throw Error();
    res.render('projects/edit', { project: project });
  })
  .catch(function(error) {
    res.status(400).render('main/404');
  });
});

//post project/edit
router.post('/edit/:id', function(req, res){
  console.log("post route for edit project")
});

// GET /projects/new - display form for creating a new project
router.get('/new', function(req, res) {
  res.render('projects/new');
});

// GET /projects/:id - display a specific project
router.get('/:id', function(req, res) {
  db.project.find({
    where: { id: req.params.id }
  })
  .then(function(project) {
    if (!project) throw Error();
    res.render('projects/show', { project: project });
  })
  .catch(function(error) {
    res.status(400).render('main/404');
  });
});

module.exports = router;
