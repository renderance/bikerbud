const { json } = require('express');
const express = require('express');
const app = express();
const fetch = require("node-fetch");
app.use(express.static('client'));
app.use(express.json());
const weatherkey = "20cc8131ac39737ce6b8656007612a45";
const weatherapi = "https://api.openweathermap.org/data/2.5/weather"

function getDefaultReplyobject(){
    let replyobject = {
        errors:[
            false,false,false,false,false,false,false,false
        ],
        warnings:[]
    };
    return replyobject;
}

function extractUrlParameters(url){
    let args = url.split('?')[1].split('&');
    let params = {};
    for(arg in args){
        params[args[arg].split('=')[0]]=args[arg].split('=')[1];
    }
    return params;
}

function makeRequestUrl(request,reply){
    try{
        let params = extractUrlParameters(request.url)
        let requestUrl = weatherapi
            +"?"
            +"lat="+params.lat
            +"&lon="+params.long
            +"&appid="+weatherkey
            +"&units="+"metric"
            +"&exclude="+"minutely,daily,hourly";
        return requestUrl;
    } catch (error) {
        reply.errors[3]=true;
    }
}

async function makeWeatherCall(request,reply){
    try{
        const response = await fetch(request);
        const json = await response.json();
        return json;
    } catch (error) {
        reply.errors[5]=true;
    }
}

function isResponseNotOK(response){
    try {
        if (!response["cod"]==200){
            if(response["cod"]==429){
                console.log("Exceeding OpenWeatherMap API Limits!")
            }
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return true;
    }
}

function isAnyTrue(array){
    if(array.includes(true)){
        return true;
    } else {
        return false;
    }
}

function determineWhichWarningsToDisplay(owmResponse){
    let warnings = [
        false,false,false,false,false,false,false,
        false,false,false,false,false,false,false,
        false,
    ]
    warnings[0]=isAnyTrue(warnings);
    warnings[14]=!warnings[0];
    return warnings;
}

async function processWeatherCall(request,response){
    let replyObject = getDefaultReplyobject();
    let requestUrl = makeRequestUrl(request,replyObject);
    let owmResponse = await makeWeatherCall(requestUrl,replyObject);
    replyObject.errors[6]=isResponseNotOK(owmResponse);
    replyObject.errors[0]=isAnyTrue(replyObject.errors);
    if(replyObject.errors[0] == false){
        replyObject.warnings = determineWhichWarningsToDisplay(owmResponse);
    }
    response.json(replyObject);
}

app.get("/weather", function (request, response){
    processWeatherCall(request,response);
})

app.listen(7070, () => console.log('BikerBud mediator listening on port 7070!'));

/*
The API response when exceeding limitations:
{ "cod": 429,
"message": "Your account is temporary blocked due to exceeding of requests limitation of your subscription type. 
Please choose the proper subscription http://openweathermap.org/price"
}

The API response for current weather:
api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}

Yields:
{
  "coord": {
    "lon": -122.08,
    "lat": 37.39
  },
  "weather": [
    {
      "id": 800,
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "base": "stations",
  "main": {
    "temp": 282.55,
    "feels_like": 281.86,
    "temp_min": 280.37,
    "temp_max": 284.26,
    "pressure": 1023,
    "humidity": 100
  },
  "visibility": 16093,
  "wind": {
    "speed": 1.5,
    "deg": 350
  },
  "clouds": {
    "all": 1
  },
  "dt": 1560350645,
  "sys": {
    "type": 1,
    "id": 5122,
    "message": 0.0139,
    "country": "US",
    "sunrise": 1560343627,
    "sunset": 1560396563
  },
  "timezone": -25200,
  "id": 420006353,
  "name": "Mountain View",
  "cod": 200
  }
 
The historic data request:
http://history.openweathermap.org/data/2.5/history/city?lat={lat}&lon={lon}&type=hour&start={start}&end={end}&appid={API key}

YIELDS:
{
  "message": "Count: 24",
  "cod": "200",
  "city_id": 4298960,
  "calctime": 0.00297316,
  "cnt": 24,
  "list": [
    {
     "dt": 1578384000,
     "main": {
       "temp": 275.45,
       "feels_like": 271.7,
       "pressure": 1014,
       "humidity": 74,
       "temp_min": 274.26,
       "temp_max": 276.48
     },
     "wind": {
       "speed": 2.16,
       "deg": 87
     },
     "clouds": {
       "all": 90
     },
     "weather": [
       {
         "id": 501,
         "main": "Rain",
         "description": "moderate rain",
         "icon": "10n"
       }
     ],
     "rain": {
       "1h": 0.9
     }
    },
    ....
  ]
}
*/