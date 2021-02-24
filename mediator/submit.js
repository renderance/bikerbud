const mysql = require('mysql');

let con = mysql.createConnection({
    host: "bikerbud_database",
    user: "mediator",
    password: "iammediator",
    database: "waypoints",
    insecureAuth : true,
    multipleStatements: true
  });
con.connect(function(err) {
    if (err) {
    	console.log("Connection to MySQL database down!");
    	throw err;
    };
    console.log("Connected to MySQL database!");
});  

function makeSQLValueList(routeID, longitudes, latitudes, indices){
    let sqlList = "";
    for(i=0; i<indices.length; i++){
        sqlList += "("
            +routeID+","
            +longitudes[i].toString()+","
            +latitudes[i].toString()+","
            +indices[i].toString()+"),";
    }
    sqlList = sqlList.slice(0,sqlList.length-1)+";";
    return sqlList;
}

function makeSQLRequest(longitudes,latitudes,indices){
    let sqlRequest = "";
    sqlRequest += "LOCK TABLES waypoints WRITE; ";
    let sqlMaxRouteID = "SELECT @max := MAX(waypoints.routeID) FROM waypoints; ";
    sqlRequest += sqlMaxRouteID;
    sqlRequest += "INSERT INTO waypoints(routeID,longitude,latitude,routeindex) VALUES ";
    let sqlRouteID = "IF(@max,@max+1,1)";
    sqlRequest += makeSQLValueList(sqlRouteID, longitudes,latitudes,indices);
    sqlRequest += sqlMaxRouteID;
    sqlRequest += "UNLOCK TABLES;"
    return sqlRequest;
}


function submitToDatabase(longitudes,latitudes,indices){
    return new Promise((resolve,reject) => {
        let sqlRequest = makeSQLRequest(longitudes,latitudes,indices);
        let query = con.query(sqlRequest,(err,results,fields) => {
            return err ? reject(err) : resolve(results[3][0]['@max := MAX(waypoints.routeID)']);
        });
    });
}

async function processSubmissionCall(request,response){
    let routeSubmission = request.body;
    routeLength = routeSubmission['length'];
    if(!(routeLength>1)){
        failResponse = {"code":406,"status":'Not Acceptable',"msg":"Route not long enough."}
        response.send(failResponse);
    }
    let indices = [];
    let longitudes = [];
    let latitudes = [];
    for(waypoint in routeSubmission['waypoints']){
        longitudes.push(routeSubmission['waypoints'][waypoint]['long']);
        latitudes.push(routeSubmission['waypoints'][waypoint]['lat']);
        indices.push(waypoint);
    };
    let routeID = await submitToDatabase(longitudes,latitudes,indices);
    let successResponse = {"code":200,"status":'OK',"routeID":routeID};
    response.send(successResponse);    
}

module.exports = {
    processSubmissionCall
  };
