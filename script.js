let city = "";
let searchCity = $("#search-city");
let searchButton = $("#search-button");
let clearButton = $("#clear-history");
let currentCity = $("#current-city");
let currentTemp = $("#temperature");
let currentHumid = $("#humidity");
let currentWSpeed = $("#wind-speed");
let currentUvindex = $("#uv-index");
let sCity = [];
// searches to see if city exists in storage
function find(c) {
    for (let i = 0; i < sCity.length; i++) {
        if (c.toUpperCase() === sCity[i]) {
            return -1;
        }
    }
    return 1;
}
// set up API key
let apiKey = "903c8900db2872587c39c0420516f55c";
// display current and future weather after getting city from input
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}
// function to get current weather
function currentWeather(city) {
    // build the URL so we can get a data from server side
    let queryUrl = "https://api.openweathermap.org/data/2.5/weather?appid=903c8900db2872587c39c0420516f55c&units=imperial&q=" + city;
    $.ajax({
        url: queryUrl,
        method: "GET",
    }).then(function (response) {

        // get current weather including city, date, icon
        console.log(response);
        // get icons 
        let weaIcon = response.weather[0].icon;
        let iconurl = "https://openweathermap.org/img/wn/" + weaIcon + ".png";
        let date = new Date(response.dt * 1000).toLocaleDateString();
        //parse the response for name of city, date and icon
        $(currentCity).html(response.name + " (" + date + ") " + "<img src=" + iconurl + ">");
        // display current temp humidity wind and uv
        $(currentTemp).html(response.main.temp.toFixed(1) + " °F");
        $(currentHumid).html(response.main.humidity + " %");
        let windsmph = response.wind.speed.toFixed(1);
        $(currentWSpeed).html(windsmph + " MPH");
        //need to get lon and lat from API and store info
        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            sCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity == null) {
                sCity = [];
                sCity.push(city.toUpperCase());
                localStorage.setItem("cityname", JSON.stringify(sCity));
                addToList(city);
            } else {
                if (find(city) > 0) {
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
// function to get uv index
function UVIndex(ln, lt) {
    //api URL to get lat and lon
    let uvUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: uvUrl,
        method: "GET"
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}

// function to display 5-day forecast for current city
function forecast(cityid) {
    let dayover = false;
    let queryForecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&units=imperial&appid=" + apiKey;
    $.ajax({
        url: queryForecastURL,
        method: "GET"
    }).then(function (response) {

        for (i = 0; i < 5; i++) {
            let date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            let iconName = response.list[((i + 1) * 8) - 1].weather[0].icon;
            let iconurl = "https://openweathermap.org/img/wn/" + iconName + ".png";
            let tempF = response.list[((i + 1) * 8) - 1].main.temp.toFixed(1);
            let windF = response.list[((i + 1) * 8) - 1].wind.speed.toFixed(1);
            let humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconurl + ">");
            $("#fTemp" + i).html(" " + tempF + " &#8457");
            $("#fWind" + i).html(" " + windF + " MPH");
            $("#fHum" + i).html(" " + humidity + " %");
        }

    });
}

// Add city to history
function addToList(c) {
    let listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}
// display the past search again when clicked in search history
function replayPastSearch(event) {
    let liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }

}

// load last city function
function loadlastCity() {
    $("ul").empty();
    let sCity = JSON.parse(localStorage.getItem("cityname"));
    if (sCity !== null) {
        sCity = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < sCity.length; i++) {
            addToList(sCity[i]);
        }
        city = sCity[i - 1];
        currentWeather(city);
    }

}
//Clear the search history from the page
function clearHistory(event) {
    event.preventDefault();
    sCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", replayPastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);