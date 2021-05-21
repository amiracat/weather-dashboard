
let city="";
let searchCity = $("#search-city");
let searchButton = $("#search-button");
let clearButton = $("#clear-history");
let currentCity = $("#current-city");
let currentTemp = $("#temperature");
let currentHumid= $("#humidity");
let currentWSpeed=$("#wind-speed");
let currentUvindex= $("#uv-index");
let sCity=[];
// searches to see if city exists in storage
function find(c){
    for (let i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}
//Set up API key
let apiKey="68f32cfc27dbbce931f1c1a67d272108";
// Display the curent and future weather to the user after grabbing the city from the input text box
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
// create the AJAX call
function currentWeather(city){
    // build the URL so we can get a data from server side
    let queryURL= "https://api.openweathermap.org/data/2.5/weather?appid=68f32cfc27dbbce931f1c1a67d272108&units=imperial&q=" + city;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        // parse the response to display the current weather including the City name. the Date and the weather icon
        console.log(response);
        //Dta object from server side Api for icon property
        let weathericon = response.weather[0].icon;
        let iconurl = "https://openweathermap.org/img/wn/"+ weathericon + ".png";
        let date=new Date(response.dt*1000).toLocaleDateString();
        //parse the response for name of city, date and icon
        $(currentCity).html(response.name + " ("+date+") " + "<img src="+iconurl+">");
        // parse the response to display the current temperature

        //let tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemp).html((response.main.temp).toFixed(1)+" °F");
        // Display the Humidity
        $(currentHumid).html(response.main.humidity+" %");
        //Display Wind speed    
        let windsmph = response.wind.speed.toFixed(1);
        $(currentWSpeed).html(windsmph + " MPH");
        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}
    // function to get uv index
function UVIndex(ln,lt){
    //api URL to get lat and lon
    let uvUrl="https://api.openweathermap.org/data/2.5/uvi?appid="+ apiKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvUrl,
            method:"GET"
            }).then(function(response){
                $(currentUvindex).html(response.value);
            });
}
    
// function to display 5-day forecast for current city
function forecast(cityid){
    let dayover= false;
    let queryForecastURL="https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&units=imperial&appid=" + apiKey;
    $.ajax({
        url:queryForecastURL,
        method:"GET"
    }).then(function(response){
        
        for (i = 0; i < 5; i++) {
            let date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            let iconcode = response.list[((i+1)*8)-1].weather[0].icon;
            let iconurl = "https://openweathermap.org/img/wn/" + iconcode + ".png";
            let tempF = response.list[((i+1)*8)-1].main.temp.toFixed(1);
            let windF = response.list[((i+1)*8)-1].wind.speed.toFixed(1);
            let humidity = response.list[((i+1)*8)-1].main.humidity;
        
            $("#fDate"+i).html(date);
            $("#fImg"+i).html("<img src=" + iconurl + ">");
            $("#fTemp"+i).html(" " + tempF + " &#8457");
            $("#fWind"+i).html(" " + windF + " MPH");
            $("#fHumidity"+i).html(" " + humidity + " %");
        }
        
    });
}

//Daynamically add the passed city on the search history
function addToList(c){
    let listEl= $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value" ,c.toUpperCase() );
    $(".list-group").append(listEl);
}
// display the past search again when clicked in search history
function displayPastSearch(event){
    let liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

// load last city function
function loadlastCity(){
    $("ul").empty();
    let sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}
//Clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}
//Click Handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", displayPastSearch);
$(window).on("load", loadlastCity);
$("#clear-history").on("click", clearHistory);
