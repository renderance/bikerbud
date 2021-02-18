const mysql = require('mysql');

function processSubmissionCall(request,response){
    let routeSubmission = request.body;
    routeLength = routeSubmission['length'];
    let routeID = null;
    for(waypoint in routeSubmission['waypoints']){
        longitude = routeSubmission['waypoints'][waypoint]['long'];
        latitude = routeSubmission['waypoints'][waypoint]['lat'];
        index = waypoint;
        if(!routeID){
            routeID = 5555
        }
    }
    successResponse = {"code":200,"status":'OK',"routeID":routeID};
    response.send(successResponse);
}

module.exports = {
    processSubmissionCall
  };