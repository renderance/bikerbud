const fetch = require("node-fetch");

const weatherkey = "20cc8131ac39737ce6b8656007612a45";
const weatherapi = "https://api.openweathermap.org/data/2.5/weather";
const weatherhistory = "https://api.openweathermap.org/data/2.5/onecall/timemachine";

function getDefaultReplyobject() {
    let replyobject = {
        errors: [
            false, false, false, false, false, false, false, false
        ],
        warnings: []
    };
    return replyobject;
}

function extractUrlParameters(url) {
    let args = url.split('?')[1].split('&');
    let params = {};
    for (arg in args) {
        params[args[arg].split('=')[0]] = args[arg].split('=')[1];
    }
    return params;
}

function appendHistoryOptions(requestUrl, day) {
    let secondsIn1day = 60 * 60 * 24;
    let currentUnixTime = Math.floor(Date.now() / 1000);
    let requestUnixTime = currentUnixTime - secondsIn1day * (3 - day);
    requestUrl = requestUrl +
        "&type=" + "hour" +
        "&dt=" + requestUnixTime
    return requestUrl;
}

function makeRequestUrl(request, reply, apiurl) {
    try {
        let params = extractUrlParameters(request.url)
        let requestUrl = apiurl +
            "?" +
            "lat=" + params.lat +
            "&lon=" + params.long +
            "&appid=" + weatherkey +
            "&units=" + "metric";
        return requestUrl;
    } catch (error) {
        reply.errors[3] = true;
    }
}

async function makeWeatherCall(request, reply) {
    try {
        const response = await fetch(request);
        const json = await response.json();
        return json;
    } catch (error) {
        console.log(error)
        reply.errors[5] = true;
    }
}

async function makeHistoryCalls(request, reply) {
    let responses = [];
    for (day in [0, 1, 2]) {
        requestUrl = appendHistoryOptions(request, day);
        responses[day] = await makeWeatherCall(requestUrl, reply);
    }
    return responses;
}

function isResponseNotOK(response) {
    try {
        if (!response["cod"] == 200) {
            if (response["cod"] == 429) {
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

function isResponsesNotOk(histResponses) {
    let anyResponseNotOk = false;
    for (response in histResponses) {
        anyResponseNotOk = isResponseNotOK(response) || anyResponseNotOk;
    }
    return anyResponseNotOk;
}

function isAnyTrue(array) {
    if (array.includes(true)) {
        return true;
    } else {
        return false;
    }
}

function isConditionMet(condition) {
    return (condition ? true : false);
}

function isConditionMetInHistory(response, condition) {
    let conditionMetInHistory = false;
    for (day in response) {
        for (hour in response[day].hourly) {
            for (entry in response[day].hourly[hour].weather) {
                let code = response[day].hourly[hour].weather[entry].id;
                let temp = response[day].hourly[hour].temp;
                conditionMetInHistory = conditionMetInHistory || isConditionMet(condition(code, temp))
            }
        }
    }
    return conditionMetInHistory;
}

function snowCondition(code, temp) {
    return (code > 599 && code < 700) ? true : false;
}

function rainCondition(code, temp) {
    return (code < 600) ? true : false;
}

function iceCondition(code, temp) {
    if ((snowCondition(code, temp) || rainCondition(code, temp)) && temp < 3) {
        return true;
    }
    return false;
}

function getTemperatureWarningsToDisplay(warnings, owmResponse) {
    warnings[13] = isConditionMet(owmResponse.main.feels_like < 5);
    warnings[12] = isConditionMet(owmResponse.main.feels_like > 30);
    warnings[11] = isAnyTrue([warnings[12], warnings[13]]);
    return warnings;
}

function getVisibilityWarningsToDisplay(warnings, owmResponse) {
    warnings[10] = isConditionMet(snowCondition(owmResponse.main.id));
    warnings[9] = isConditionMet(owmResponse.main.id == 701 || owmResponse.main.id == 741);
    warnings[8] = isConditionMet(rainCondition(owmResponse.main.id));
    warnings[7] = isAnyTrue([warnings[8], warnings[9], warnings[10]]);
    return warnings;
}

function getWindWarningsToDisplay(warnings, owmResponse) {
    warnings[6] = isConditionMet(owmResponse.wind.speed > 6 || owmResponse.wind.gust > 7);
    warnings[5] = isAnyTrue([warnings[5]]);
    return warnings;
}

function getSlidingWarningsToDisplay(warnings, histResponses) {
    warnings[4] = isConditionMetInHistory(histResponses, snowCondition);
    warnings[3] = isConditionMetInHistory(histResponses, rainCondition);
    warnings[2] = isConditionMetInHistory(histResponses, iceCondition);
    warnings[1] = isAnyTrue([warnings[2], warnings[3], warnings[4]]);
    return warnings;
}

function determineWhichWarningsToDisplay(owmResponse, histResponses) {
    let warnings = [
        false, false, false, false, false, false, false,
        false, false, false, false, false, false, false,
        false,
    ]
    warnings = getTemperatureWarningsToDisplay(warnings, owmResponse);
    warnings = getVisibilityWarningsToDisplay(warnings, owmResponse);
    warnings = getWindWarningsToDisplay(warnings, owmResponse);
    warnings = getSlidingWarningsToDisplay(warnings, histResponses);
    warnings[0] = isAnyTrue(warnings);
    warnings[14] = !warnings[0];
    return warnings;
}

async function processWeatherCall(request, response) {
    let replyObject = getDefaultReplyobject();
    let requestOwmUrl = makeRequestUrl(request, replyObject, weatherapi);
    let requestHistUrl = makeRequestUrl(request, replyObject, weatherhistory);
    let owmResponse = await makeWeatherCall(requestOwmUrl, replyObject);
    let histResponses = await makeHistoryCalls(requestHistUrl, replyObject);
    replyObject.errors[6] = isResponseNotOK(owmResponse);
    replyObject.errors[6] = isResponsesNotOk(histResponses) || replyObject.errors[6];
    replyObject.errors[0] = isAnyTrue(replyObject.errors);
    if (replyObject.errors[0] == false) {
        replyObject.warnings = determineWhichWarningsToDisplay(owmResponse, histResponses);
    }
    response.json(JSON.stringify(replyObject));
}

module.exports = {
    processWeatherCall,
    extractUrlParameters
};