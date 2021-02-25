let errStrings = ["Errors:",
    "BikerBud API does not respond!",
    "BikerBud API gave error response!",
    "BikerBud API could not understand app request!",
    "BikerBud App could not understand API response!",
    "Weather API does not respond!",
    "Weather API gave error response!",
    "Weather API could not understand API request!",
    "BikerBud API could not understand Weather API response!"
]
let warnStrings = ["Warnings:",
    "Sliding danger:",
    "Icy Roads",
    "Wet Roads",
    "Snow",
    "Dangerous winds:",
    "High Wind Speed",
    "Bad visibility:",
    "Rainfall",
    "Mist",
    "Snowfall",
    "Extreme temperature:",
    "Heat",
    "Cold",
    "Nothing to report."
];
let advString = "As always: Dress for the slide, not the ride.";

async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handlelocation, () => {
            var x = document.getElementById("map")
            x.innerHTML = "Geolocation is not supported by this browser.";
        })
    }
}

async function makeWeatherCall(request, errorArray) {
    try {
        const response = await fetch(request);
        const json = await response.json();
        return json;
    } catch (error) {
        console.log(error)
    }
}

function appendErrorsOrWarnings(typestring, textArray, display, warningsObject) {
    for (entry in warningsObject) {
        if (warningsObject[entry] == true) {
            let template = document.getElementById(typestring + "ContentTemplate");
            if (entry == 0) {
                template = document.getElementById(typestring + "HeaderTemplate");
            }
            let clone = template.content.cloneNode(true);
            clone.querySelector('.text').textContent = textArray[entry];
            display.appendChild(clone);
        }
    }
}

function appendErrorsAndWarnings(display, warningsObject) {
    appendErrorsOrWarnings("error", errStrings, display, warningsObject['errors']);
    appendErrorsOrWarnings("warning", warnStrings, display, warningsObject['warnings']);
    let template = document.getElementById("warningContentTemplate");
    let clone = template.content.cloneNode(true);
    clone.querySelector('.text').textContent = advString;
    display.appendChild(clone);
}

async function getWeatherWarnings(latitude, longitude) {
    var display = document.getElementById("warningdisplay");
    requestUrl =
        "/weather?" +
        "long=" + longitude +
        "&" +
        "lat=" + latitude;
    const fetchResponse = await fetch(requestUrl);
    const warningsObject = await fetchResponse.json();
    appendErrorsAndWarnings(display, warningsObject)
}

function positionMap(lat, lon) {
    L.mapquest.key = 'oQDLZe52PfGqbqecAG3EQRb60ACRzXnP';
    var map = L.mapquest.map('map', {
        center: [lat, lon],
        layers: L.mapquest.tileLayer('map'),
        zoom: 13
    });
    map.addControl(L.mapquest.control());
}

async function handlelocation(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    positionMap(lat, lon);
    getWeatherWarnings(lat, lon);
}

window.onload = function() {
    getLocation()
}