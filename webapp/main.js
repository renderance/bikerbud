const { json } = require('express');
const express = require('express');
const fetch = require("node-fetch");
const https = require('https');
const fs = require('fs');
const { STATUS_CODES } = require('http');
const credentials = {
    key: fs.readFileSync('sec/key.pem'),
    cert: fs.readFileSync('sec/cert.pem')
};
const app = express();
app.use(express.static('client'));
app.use(express.json());

function getDefaultReplyobject() {
    let replyobject = {
        errors: [
            true, false, false, true, false, false, false, false
        ],
        warnings: []
    };
    return replyobject;
}

async function handleRequest(request, response) {
    try {
        const reply = await fetch("http://bikerbud_mediator:7000/weather?" + request.url.split("?")[1])
        const jsonObj = await reply.json();
        response.json(jsonObj)
    } catch (error) {
        console.log(error)
        replyObj = getDefaultReplyobject();
        response.json(replyObj)
    }
}

app.get("/weather", function(request, response) {
    handleRequest(request, response);
})

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(9000, () => console.log('BikerBud webapp securely listening on port 9000!'));