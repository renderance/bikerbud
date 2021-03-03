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
imgmap = ['2', '3', '4', '6', '8', '9', '10', '12', '13'];
imagelist = ['',
    '',
    './img/snowflake.svg',
    './img/rain.svg',
    './img/snow.svg',
    '',
    './img/wind.svg',
    '',
    './img/rain.svg',
    './img/mist.svg',
    './img/snow.svg',
    '',
    './img/high-temperature.svg',
    './img/low-temperature.svg',
    ''
];
let advString = "As always: Dress for the slide, not the ride.";
let mapQuestMap;
let drawLayer;
let routeLayer;
let drawMarkers = [];

async function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handlelocation, () => {
            let x = document.getElementById("map");
            let y = document.getElementById("warningdisplay");
            let z = document.getElementById("routedisplay");
            x.innerHTML = "Geolocation is disabled.";
            y.innerHTML = "Geolocation is disabled.";
            z.innerHTML = "Geolocation is disabled.";
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

function findImageToWarning(entry) {
    return imagelist[entry];
}

function appendErrorsOrWarnings(typestring, textArray, display, warningsObject) {
    for (entry in warningsObject) {
        if (warningsObject[entry] == true) {
            let wrapper = document.getElementById(typestring + "ContentTemplate");
            if (entry == 0) {
                wrapper = document.getElementById(typestring + "HeaderTemplate");
            }
            let thiswrapper = wrapper.content.cloneNode(true);
            if (typestring == "warning") {
                let imageresource = findImageToWarning(entry);
                if (imageresource != '') {
                    let image = document.getElementById("warningContentImgTemplate");
                    let thisimage = image.content.cloneNode(true);
                    thisimage.getElementById("warningContentImg").src = imageresource;
                    thiswrapper.querySelector('.wrap').appendChild(thisimage);
                }
            }
            let textcontent = document.getElementById("contentTextTemplate");
            let thistextcontent = textcontent.content.cloneNode(true);
            thistextcontent.querySelector(".text").textContent = textArray[entry];
            thiswrapper.querySelector('.wrap').appendChild(thistextcontent);
            display.appendChild(thiswrapper);
        }
    }
}

function appendErrorsAndWarnings(display, warningsObject) {
    appendErrorsOrWarnings("error", errStrings, display, warningsObject['errors']);
    appendErrorsOrWarnings("warning", warnStrings, display, warningsObject['warnings']);
    let template = document.getElementById("warningContentTemplate");
    let clone = template.content.cloneNode(true);
    let textcontent = document.getElementById("contentTextTemplate");
    let thistextcontent = textcontent.content.cloneNode(true);
    thistextcontent.querySelector(".text").textContent = advString;
    clone.querySelector('.wrap').appendChild(thistextcontent);
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

async function getNearbyRoutes(latMin, latMax, lonMin, lonMax) {
    try {
        const reply = await fetch(
            "/routes?" +
            "latmin=" + latMin + "&" +
            "latmax=" + latMax + "&" +
            "lonmin=" + lonMin + "&" +
            "lonmax=" + lonMax
        )
        const jsonObj = await reply.json();
        return jsonObj;
    } catch (error) {
        console.log(error)
        return {};
    }
}

async function drawNearbyRoutes() {
    routeLayer.clearLayers();
    let boundaries = mapQuestMap.getBounds();
    let latMin = boundaries._southWest.lat;
    let latMax = boundaries._northEast.lat;
    let lonMin = boundaries._southWest.lng;
    let lonMax = boundaries._northEast.lng;
    let routes = await getNearbyRoutes(latMin, latMax, lonMin, lonMax);
    for (route in routes) {
        for (entry in routes[route]) {
            waypoint = routes[route][entry];
            routeLayer.addLayer(L.circle([waypoint.latitude, waypoint.longitude], {
                radius: 2,
                color: '#FF9356',
                opacity: 1,
                fill: true,
                fillOpacity: 1
            }));
            if (entry > 0) {
                oldwaypoint = routes[route][entry - 1];
                let coords = [
                    [oldwaypoint.latitude, oldwaypoint.longitude],
                    [waypoint.latitude, waypoint.longitude]
                ]
                routeLayer.addLayer(L.polyline(
                    coords, {
                        color: '#FF9356'
                    }
                ));
            }
        }
    }
}

function positionMap(lat, lon) {
    L.mapquest.key = 'oQDLZe52PfGqbqecAG3EQRb60ACRzXnP';
    mapQuestMap = L.map('map', {
        center: [lat, lon],
        layers: L.mapquest.tileLayer('map'),
        zoom: 13,
        minZoom: 5
    });
    L.marker([lat, lon], {
        icon: L.mapquest.icons.marker({
            primaryColor: '#FF9356',
            secondaryColor: '#D16C52',
            shadow: false,
            size: 'sm',
        }),
        draggable: false
    }).addTo(mapQuestMap);
    routeLayer = L.layerGroup();
    drawLayer = L.layerGroup();
    drawNearbyRoutes();
    routeLayer.addTo(mapQuestMap);
    drawLayer.addTo(mapQuestMap);
    mapQuestMap.on('moveend', () => drawNearbyRoutes());
}

function addExplanationToWindow() {
    let explanation1 = "By clicking the 'begin drawing' button," +
        " and subsequently right-clicking somewhere on the map," +
        " you can place a route marker.";
    let explanation2 = "Once you have placed all" +
        " markers for your route, press the 'submit route' button," +
        " to send it to our database.";
    let routeDisplay = document.querySelector('#routedisplay');
    let textcontent = document.getElementById("contentTextTemplate");
    let exp1content = textcontent.content.cloneNode(true);
    exp1content.querySelector(".text").textContent = explanation1;
    exp2content = textcontent.content.cloneNode(true);
    exp2content.querySelector(".text").textContent = explanation2;
    routeDisplay.appendChild(exp1content);
    routeDisplay.appendChild(exp2content);
}

async function handleSubmitButtonClick(somevent) {
    postObject = JSON.stringify({
        waypoints: drawMarkers,
        length: drawMarkers.length
    });
    await fetch("/submit", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: postObject
    });
    drawNearbyRoutes();
    handleClearButtonClick({ target: document.getElementById("drawButton") })
}

function addSubmitRouteButton() {
    let routeDisplay = document.querySelector('#routedisplay');
    let buttonTemplate = document.getElementById("routeButtonTemplate");
    let buttonWrapper = buttonTemplate.content.cloneNode(true);
    let button = buttonWrapper.querySelector(".button");
    button.textContent = "Submit route";
    button.id = "submitButton";
    routeDisplay.appendChild(button);
    button.addEventListener('click',
        handleSubmitButtonClick
    );
}

function handleClearButtonClick(somevent) {
    somevent.target.removeEventListener('click', handleClearButtonClick);
    somevent.target.textContent = "Begin drawing";
    somevent.target.addEventListener('click',
        handleBeginDrawingClick
    );
    drawLayer.clearLayers();
    drawMarkers = [];
    mapQuestMap.off('click', drawNewRoutePoint);
    document.getElementById("submitButton").remove();
}

function drawNewRoutePoint(somevent) {
    drawLayer.addLayer(L.circle(somevent.latlng, {
        radius: 3,
        color: '#A1300E',
        opacity: 1,
        fill: true,
        fillOpacity: 1
    }));
    if (drawMarkers.length > 0) {
        oldDrawPoint = drawMarkers[drawMarkers.length - 1];
        let coords = [
            [oldDrawPoint.lat, oldDrawPoint.long],
            somevent.latlng
        ]
        drawLayer.addLayer(L.polyline(
            coords, {
                color: '#A1300E'
            }
        ));
    }
    drawMarkers.push({ long: somevent.latlng.lng, lat: somevent.latlng.lat })
}

function handleBeginDrawingClick(somevent) {
    somevent.target.removeEventListener('click', handleBeginDrawingClick);
    somevent.target.textContent = "Clear route";
    somevent.target.addEventListener('click',
        handleClearButtonClick
    );
    addSubmitRouteButton();
    mapQuestMap.on('click', drawNewRoutePoint);
}

function addBeginDrawingButtonToWindow() {
    let routeDisplay = document.querySelector('#routedisplay');
    let buttonTemplate = document.getElementById("routeButtonTemplate");
    let buttonWrapper = buttonTemplate.content.cloneNode(true);
    let button = buttonWrapper.querySelector(".button");
    button.textContent = "Begin drawing";
    button.id = "drawButton";
    routeDisplay.appendChild(button);
    button.addEventListener('click',
        handleBeginDrawingClick
    );
}

function loadSubmissionWindow() {
    addExplanationToWindow();
    addBeginDrawingButtonToWindow();
}

async function handlelocation(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    getWeatherWarnings(lat, lon);
    positionMap(lat, lon);
    loadSubmissionWindow();
}

window.onload = function() {
    getLocation()
}