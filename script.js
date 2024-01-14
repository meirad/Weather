async function getApi(location){
    const baseUrl = 'http://api.weatherapi.com/v1/forecast.json';
    const apiKey = '3b9f770da2074b5f965125001232412';
    const days = '5';
    const apiUrl = `${baseUrl}?key=${apiKey}&q=${location}&aqi=no&days=${days}`;
    let response = await fetch(apiUrl);

    let data =  await response.json(); 
    let timezone = data.location.tz_id;

    startClock(timezone);
    console.log(timezone);

    return {data, timezone};
}


let intervalId;

function startClock(timezone) {
    // Clear the previous interval
    if (intervalId) {
        clearInterval(intervalId);
    }

    intervalId = setInterval(() => {
        let date = new Date();   
        let options = {timeZone: timezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true};
        let time = date.toLocaleTimeString('en-US', options);
    
        let dateElement = document.getElementById('date');
        dateElement.innerHTML = ''; // Clear the previous time
        dateElement.innerHTML = time; // Set the new time
    }, 1000)
}
async function printTodaysWeather(location) {
    const { data, timezone } = await getApi(location);
    const weather = data.current;
    const locationData = data.location;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[new Date().getDay()];
    fahrenheit = weather.temp_f;
    celsius = weather.temp_c;

    

    const template = `
        
        <div id="temp">
     ${weather.temp_c}°C
        </div>
            <div id="wind">
        <div id="condition">${weather.condition.text}</div>
        
        Wind: ${weather.wind_kph} kph<br>
        Humidity: ${weather.humidity}%
        </div>
    `;
    document.getElementById('weather').innerHTML = template;

  
    const localDateTime = new Date(locationData.localtime);
    const localTime = localDateTime.toLocaleTimeString();


    
    const template2 = `
    <div id="palce">${locationData.country}, ${locationData.name} - 
    <input type="text" id="changeLocation" placeholder="Enter location" >
    <button id="btn">change</button> </div>
    <div id="DATE" >${dayOfWeek} 
    <div id="date"> ${localTime} </div>

    </div>
    `;



    document.getElementById('location').innerHTML = template2;

    document.getElementById('location').innerHTML = template2;

    // Place the geolocation code here
   
    
      
    document.getElementById('btn').addEventListener('click', async function() {
        try {
            const location = document.getElementById('changeLocation').value;
            if (!location.trim()) {
                throw new Error("Location cannot be empty");
            }
            await printTodaysWeather(location);
            await printWeeksWeather(location);
        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });

    if (weather.condition.text.toLowerCase().includes('rain')) {
        document.body.style.backgroundImage = "url('rainy.jpg')";
        document.body.style.color = "white";
    }
    else if (weather.condition.text.toLowerCase().includes('cloud')) {
        document.body.style.backgroundImage = "url('cloudy.jpg')";
        document.body.style.color = "white";
        document.input.style.color = "white";


    }
    else if (weather.condition.text.toLowerCase().includes('sun')) {
        document.body.style.backgroundImage = "url('sunday.jpg')";
        document.body.style.color = "black";

    }
    else {
        document.body.style.backgroundImage = "url('snowy.jpg')";
        document.body.style.color = "black";

}

    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
}


let weeksWeather; 

async function printWeeksWeather(location){
    const { data, timezone } = await getApi(location);
    let weeksWeather = data.forecast.forecastday; 
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    let forecastHTML = '';
    for(let index = 0; index < 5; index++) {
        const day = weeksWeather[index];
        if (day) {
            const date = new Date(day.date);
            const dayOfWeek = days[date.getDay()];
    
            forecastHTML += `
                <div class="day">
                    <div class="image">
                        <img src="https:${day.day.condition.icon}"> 
                    </div>
                    <div class="description">
                        <h2>${dayOfWeek}</h2>
                        <p>${day.day.condition.text}</p>
                        <p class="min-max" id="day${index}">                        
                        <span class="max">${day.day.maxtemp_c}°</span> -
                            <span class="min">${day.day.mintemp_c}°</span>
                        </p>
                    </div>
                </div>
            `;
        }
    }
    document.getElementById('forcast').innerHTML = forecastHTML;
}


if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        async function (position) {
            const location = `${position.coords.latitude},${position.coords.longitude}`;
            await printTodaysWeather(location);
            await printWeeksWeather(location);
        },
        function (error) {
            console.error("Error getting location: " + error.message);
        }
    );
} else {
    console.error("Geolocation is not supported in this browser");
}



    printTodaysWeather(location);
    printWeeksWeather(location);


    // This function toggles the temperature between Celsius and Fahrenheit
    
    function toggleTemp() {
        const checkbox = document.getElementById('tempSwitch');
        if (checkbox.checked) {
            document.getElementById('temp').innerHTML = `${fahrenheit}°F`;
            for (let i = 0; i < 7; i++) {
                const day = document.getElementById(`day${i}`);
                day.querySelector('.max').innerHTML = `${weeksWeather[i].day.maxtemp_f}°F`;
                day.querySelector('.min').innerHTML = `${weeksWeather[i].day.mintemp_f}°F`;
            }
        } else {
            document.getElementById('temp').innerHTML = `${celsius}°C`;
            for (let i = 0; i < 7; i++) {
                const day = document.getElementById(`day${i}`);
                day.querySelector('.max').innerHTML = `${weeksWeather[i].day.maxtemp_c}°C`;
                day.querySelector('.min').innerHTML = `${weeksWeather[i].day.mintemp_c}°C`;
            }
        }
    }
    document.addEventListener('DOMContentLoaded', (event) => {
        document.getElementById('tempSwitch').addEventListener('change', toggleTemp);
    });
