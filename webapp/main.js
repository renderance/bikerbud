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

async function handleRequest(type, request, response) {
    try {
        const reply = await fetch("http://bikerbud_mediator:7000" + type + "?" + request.url.split("?")[1], request.body)
        const jsonObj = await reply.json();
        response.json(jsonObj)
    } catch (error) {
        console.log(error)
        replyObj = {};
        response.json(JSON.stringify(replyObj))
    }
}

async function handlePostRequest(type, request, response) {
    try {
        const reply = await fetch("http://bikerbud_mediator:7000" + type, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(request.body)
        })
        const jsonObj = await reply.json();
        response.json(jsonObj)
    } catch (error) {
        console.log(error)
        replyObj = {};
        response.json(JSON.stringify(replyObj))
    }
}

app.get("/weather", function(request, response) {
    handleRequest('/weather', request, response);
})

app.get("/routes", function(request, response) {
    handleRequest('/routes', request, response);
})

app.post("/submit", function(request, response) {
    handlePostRequest('/submit', request, response);
})

app.post("/navigation", function(request, response) {
    handlePostRequest('/navigation', request, response);
})

var httpsServer = https.createServer(credentials, app);
httpsServer.listen(9000, () => console.log('BikerBud webapp securely listening on port 9000!'));