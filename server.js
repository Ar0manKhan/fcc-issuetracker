'use strict';

const express = require('express');
const expect = require('chai').expect;
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

// Connecting to mongoose database
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

// Creating Schema for database
const { Schema } = mongoose;
const issue_schema = new Schema({
  assigned_to: String,
  status_text: String,
  open: Boolean,
  issue_title: String,
  issue_text: String,
  created_by: String,
  created_on: Date,
  updated_on: Date
}, { versionKey: false });

let app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (_req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// Function that will extract all data from request and return in object fromat
const create_issue_obj = (body) => {

  // Extracting all datas from request body
  const { issue_title, issue_text, created_by, assigned_to, status_text, open } = body;

  let return_object = {
    issue_title,
    issue_text,
    created_by,
    assigned_to,
    status_text,
    open,
    updated_on: new Date()
  }

  // Deleting undefined item to make compatible with all forms
  Object.keys(return_object).forEach(key => {
    if (!return_object[key]) delete return_object[key]
  });

  return return_object;
}

app.route('/api/issues/:project').post((req, res) => {

  // Creating schema to make it work with every project
  const Issue = mongoose.model(req.params.project, issue_schema);

  let issue_obj = create_issue_obj(req.body);
  issue_obj.created_on = new Date();
  issue_obj.open = true;

  // Creating issue and saving it
  const new_issue = new Issue(issue_obj);

  new_issue.save((err, data) => {
    if (err) res.send('Some error');
    else {
      res.json(data);
    };
  });
});

app.route('/api/issues/:project').put((req, res) => {

  // Creating schema to make it work with every project
  const Issue = mongoose.model(req.params.project, issue_schema);

  let _id = req.body._id;
  let issue_obj = create_issue_obj(req.body);

  Issue.findByIdAndUpdate(_id, issue_obj, { new: true }, (err, data) => {
    if (err) res.send('Error while updating');
    else res.json({
      result: "successfully updated",
      _id
    });
  });
});

app.route('/api/issues/:project').delete((req, res) => {

  // Creating schema to make it work with every project
  const Issue = mongoose.model(req.params.project, issue_schema);

  let _id = req.body._id;

  Issue.findByIdAndRemove(_id, (err, data) => {
    if (err) res.send('Error while deleting');
    else res.json({
      result: "successfully deleted",
      _id
    });
  });
});

app.route('/api/issues/:project').get((req, res) => {

  // Creating schema to make it work with every project
  const Issue = mongoose.model(req.params.project, issue_schema);

  Issue.find({}, (err, data) => {
    if (err) res.send('Error while fetching data');
    else res.json(data);
  });
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        let error = e;
        console.log('Tests are not valid:');
        console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
