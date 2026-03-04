// ============================
// CONFIG
// ============================
const API_KEY = "976432ff6081665dee3607c92ccd21a8";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

// ============================
// DOM ELEMENTS (CACHED)
// ============================
const dayNameEl = document.getElementById("dayName");
const fullDateEl = document.getElementById("fullDate");
const cityNameEl = document.getElementById("cityName");
const temperatureEl = document.getElementById("temperature");
const weatherConditionEl = document.getElementById("weatherCondition");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("windSpeed");
const weatherIconEl = document.getElementById("weatherIcon");
const airQualityEl = document.getElementById("airQuality");

const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");

// ============================
// UI STATE HANDLER
// ============================
function setLoading(isLoading) {
    form.querySelector("button").disabled = isLoading;
}

// ============================
// AQI MAPPING
// ============================
function getAQIDetails(aqi) {
    const AQI_MAP = {
        1: { label: "Good 😊", color: "#3DC435" },
        2: { label: "Fair 🙂", color: "#aaee2b" },
        3: { label: "Moderate 😐", color: "#f7b32a" },
        4: { label: "Poor 😷", color: "#ff8818" },
        5: { label: "Very Poor ☠", color: "#d32323" }
    };

    return AQI_MAP[aqi] || { label: "Unknown", color: "#ffffff" };
}

// ============================
// FETCH HELPER (Professional)
// ============================
async function fetchJSON(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    return response.json();
}

// ============================
// MAIN FUNCTION
// ============================
async function getWeather(city) {
    setLoading(true);

    try {
        //  Weather API
        const weatherUrl =
            `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const weatherData = await fetchJSON(weatherUrl);

        const { lat, lon } = weatherData.coord;

        //  Air Pollution API
        const airUrl =
            `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

        const airData = await fetchJSON(airUrl);

        const aqi = airData.list[0].main.aqi;
        const pm25 = airData.list[0].components.pm2_5;

        const { label, color } = getAQIDetails(aqi);


        // --------------------
        // DATE (dynamic)
        // --------------------
        const now = new Date();

        dayNameEl.textContent =
            now.toLocaleDateString('en-US', { weekday: 'long' });

        fullDateEl.textContent =
            now.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        // --------------------
        // LOCATION
        // --------------------
        cityNameEl.textContent =
            `${weatherData.name}, ${weatherData.sys.country}`;

        // --------------------
        // WEATHER ICON + CONDITION
        // --------------------
        const iconCode = weatherData.weather[0].icon;
        const condition = weatherData.weather[0].main;

        weatherIconEl.src =
            `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        weatherConditionEl.textContent = condition;

        // --------------------
        // TEMPERATURE
        // --------------------
        temperatureEl.textContent =
            `${Math.round(weatherData.main.temp)}°C`;

        // --------------------
        // HUMIDITY
        // --------------------
        humidityEl.textContent =
            `${weatherData.main.humidity}%`;

        // --------------------
        // WIND (convert m/s → km/h)
        // --------------------
        const windKmH = Math.round(weatherData.wind.speed * 3.6);

        windSpeedEl.textContent =
            `${windKmH} km/h`;

            
        // --------------------
        // AIR QUALITY
        // --------------------
        airQualityEl.textContent = label;
        airQualityEl.style.color = color;


    } catch (error) {
        console.error("Error:", error);
        alert("City not found or network error. Please try again.");
    } finally {
        setLoading(false);
    }
}

// ============================
// FORM SUBMIT HANDLER
// ============================
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    getWeather(city);
});