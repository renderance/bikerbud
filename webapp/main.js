const { json } = require('express');
const express = require('express');
const app = express();
app.use(express.static('client'));
app.use(express.json());

app.listen(9000, () => console.log('BikerBud webapp listening on port 9000!'));
