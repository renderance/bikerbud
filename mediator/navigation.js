const mysql = require('mysql');
const submit = require('./submit.js');
const fetch = require("node-fetch");
const mapquestkey = process.env.MAP_QUEST_API_KEY;
const directionapi = "http://www.mapquestapi.com/directions/v2/route";

function makeNavSQLRequest(routeNumber) {
    let sqlRequest = "SELECT longitude,latitude,routeindex FROM waypoints " +
        "WHERE waypoints.routeID = " + routeNumber + ";";
    return sqlRequest;
}

async function makeNavSQLCall(requestString) {
    return new Promise((resolve, reject) => {
        submit.con.query(requestString, (err, results) => {
            return err ? reject(err) : resolve(results);
        });
    });
}

async function makeNavigationCall(waypointlist) {
    let requestBody = { locations: waypointlist };
    try {
        const reply = await fetch(directionapi + "?key=" + mapquestkey, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(requestBody)
        });
        let jsonObj = await reply.json();
        return jsonObj;
    } catch (error) {
        console.log(error);
        return {};
    }
}

async function coordinateNavCalls(waypointlist) {
    let results = [];
    if (waypointlist.length > 40) {
        console.log("Waypointlist too long for Navigation API.");
        let outcome = await coordinateNavCalls(waypointlist.slice(0, 40));
        results = results.concat(outcome);
        let outcome2 = await coordinateNavCalls(waypointlist.slice(40));
        results = results.concat(outcome2);
    } else {
        let outcome = await makeNavigationCall(waypointlist);
        results = results.concat(outcome.route.legs);
    }
    return results;
}

async function processNavCall(request, response) {
    let routeNum = request.body.routeID;
    let direction = request.body.direction;
    let navSQLRequest = makeNavSQLRequest(routeNum);
    let navSQLResponse = await makeNavSQLCall(navSQLRequest);
    let waypointlist = [];
    if (request.body.home) {
        waypointlist.push(
            "" + request.body.home.lat + "," + request.body.home.lon
        );
    };
    for (let i = 0; i < navSQLResponse.length; i++) {
        let index = direction == 'reverse' ? navSQLResponse.length - i - 1 : i;
        waypointlist.push(
            "" + navSQLResponse[index].latitude + "," + navSQLResponse[index].longitude
        );
    };
    let replyObj = await coordinateNavCalls(waypointlist);
    let maneuvers = [];
    for (leg in replyObj) {
        maneuvers = maneuvers.concat(replyObj[leg].maneuvers);
    }
    response.json(maneuvers);
}

module.exports = {
    processNavCall,
};
