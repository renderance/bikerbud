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
let imgmap = ['2', '3', '4', '6', '8', '9', '10', '12', '13'];
let imagelist = ['',
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
let markerLat;
let markerLon;

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

async function getWeatherWarnings() {
    var display = document.getElementById("warningdisplay");
    requestUrl =
        "/weather?" +
        "long=" + markerLon +
        "&" +
        "lat=" + markerLat;
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

async function getRouteDirections(routeNumber, directionString, homeCoordinates) {
    let navRequestBody = { routeID: routeNumber, direction: directionString };
    if (homeCoordinates) {
        navRequestBody['home'] = homeCoordinates;
    };
    try {
        const reply = await fetch("/navigation", {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(navRequestBody)
        });
        const jsonObj = await reply.json();
        return jsonObj;
    } catch (error) {
        console.log(error)
        return {};
    }
}

function displayDirections(directions) {
    console.log(directions);
    document.getElementById("nav").innerHTML = '';
    let boxTemplate = document.getElementById("navigationBoxTemplate");
    let box = boxTemplate.content.cloneNode(true);
    let display = box.getElementById("navigationdisplay");
    for (step in directions) {
        direction = directions[step];
        if (direction.turnType != 0 || step == 0) {
            if (direction.turnType != -1 || step == directions.length - 1) {
                imageresource = direction.iconUrl;
                narrative = direction.narrative;
                let wrapper = document.getElementById("warning" + "ContentTemplate");
                let thiswrapper = wrapper.content.cloneNode(true);
                let image = document.getElementById("warningContentImgTemplate");
                let thisimage = image.content.cloneNode(true);
                thisimage.getElementById("warningContentImg").src = imageresource;
                thiswrapper.querySelector('.wrap').appendChild(thisimage);
                let textcontent = document.getElementById("contentTextTemplate");
                let thistextcontent = textcontent.content.cloneNode(true);
                thistextcontent.querySelector(".text").textContent = narrative;
                thiswrapper.querySelector('.wrap').appendChild(thistextcontent);
                display.appendChild(thiswrapper);
            }
        }
    }
    document.getElementById("nav").appendChild(box);
}

async function handleNavigationButtonGreenPurpleClick(somevent) {
    let routeNum = parseInt(somevent.target.parentElement.querySelector("#routeNumber").textContent);
    let directions = await getRouteDirections(routeNum, 'forward', null);
    displayDirections(directions);
}

async function handleNavigationButtonPurpleGreenClick(somevent) {
    let routeNum = parseInt(somevent.target.parentElement.querySelector("#routeNumber").textContent);
    let directions = await getRouteDirections(routeNum, 'reverse', null);
    displayDirections(directions);

}

async function handleNavigationButtonMarkerGreenPurpleClick(somevent) {
    let routeNum = parseInt(somevent.target.parentElement.querySelector("#routeNumber").textContent);
    let markerLoc = { lat: markerLat, lon: markerLon };
    let directions = await getRouteDirections(routeNum, 'forward', markerLoc);
    displayDirections(directions);
}

async function handleNavigationButtonMarkerPurpleGreenClick(somevent) {
    let routeNum = parseInt(somevent.target.parentElement.querySelector("#routeNumber").textContent);
    let markerLoc = { lat: markerLat, lon: markerLon };
    let directions = await getRouteDirections(routeNum, 'reverse', markerLoc);
    displayDirections(directions);
}

function registerNavigationButtonListeners(htmlElement) {
    htmlElement.getElementById("directionsFromGreenToPurple")
        .addEventListener('click', handleNavigationButtonGreenPurpleClick);
    htmlElement.getElementById("directionsFromPurpleToGreen")
        .addEventListener('click', handleNavigationButtonPurpleGreenClick);
    htmlElement.getElementById("directionsFromMarkerThroughGreenToPurple")
        .addEventListener('click', handleNavigationButtonMarkerGreenPurpleClick);
    htmlElement.getElementById("directionsFromMarkerThroughPurpleToGreen")
        .addEventListener('click', handleNavigationButtonMarkerPurpleGreenClick);
}

function createPopup(routeID) {
    let popupHTML = document.getElementById("popupTemplate").content.cloneNode(true);
    popupHTML.getElementById("routeNumber").textContent = routeID;
    let newPopup = L.popup();
    newPopup.setContent(popupHTML);
    registerNavigationButtonListeners(popupHTML);
    return newPopup;
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
            let drawnWaypoint = L.circle(
                [waypoint.latitude, waypoint.longitude], {
                    radius: 2,
                    color: '#FF9356',
                    opacity: 1,
                    fill: true,
                    fillOpacity: 1
                }
            );
            if (entry == 0 || entry == (routes[route].length - 1)) {
                drawnWaypoint.setRadius(12);
                let specialColor = entry == 0 ? '#1e8a20' : '#a11f7a'
                drawnWaypoint.setStyle({ color: specialColor })
            }
            drawnWaypoint.bindPopup(createPopup(waypoint.routeID));
            routeLayer.addLayer(drawnWaypoint);
            if (entry > 0) {
                oldwaypoint = routes[route][entry - 1];
                let coords = [
                    [oldwaypoint.latitude, oldwaypoint.longitude],
                    [waypoint.latitude, waypoint.longitude]
                ];
                let drawnWaypointEdge = L.polyline(
                    coords, {
                        color: '#FF9356'
                    }
                );
                drawnWaypointEdge.bindPopup(createPopup(waypoint.routeID));
                routeLayer.addLayer(drawnWaypointEdge);
            }
        }
    }
}

function positionMap() {
    L.mapquest.key = 'oQDLZe52PfGqbqecAG3EQRb60ACRzXnP';
    mapQuestMap = L.map('map', {
        center: [markerLat, markerLon],
        layers: L.mapquest.tileLayer('map'),
        zoom: 13,
        minZoom: 5
    });
    L.marker([markerLat, markerLon], {
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
    markerLat = position.coords.latitude;
    markerLon = position.coords.longitude;
    getWeatherWarnings();
    positionMap();
    loadSubmissionWindow();
}

window.onload = function() {
    getLocation()
}