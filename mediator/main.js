const { json } = require('express');
const express = require('express');
const app = express();
app.use(express.static('client'));
app.use(express.json());

const weather = require('./weather.js');
const submit = require('./submit.js');

app.post("/submit", function (request, response){
  console.log("Receiving route submission from app.");
  submit.processSubmissionCall(request,response);
})

app.get("/weather", function (request, response){
    console.log("Receiving weather call from app.");
    weather.processWeatherCall(request,response);
})

app.listen(7070, () => console.log('BikerBud mediator listening on port 7070!'));