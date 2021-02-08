const express = require('express');
const app = express();
app.use(express.static('client'));
app.use(express.json());

app.listen(7070, () => console.log('Example app listening on port 7070!'));
