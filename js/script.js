const API_KEY = "c14ee76cfde0efbba2b3800719d0b7bc"
const DEFAULT_COORDS = new Object()
DEFAULT_COORDS.lat = 41.6459
DEFAULT_COORDS.lon = -88.6217

function loadCityDataByName(city){
	var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
	return loadCityDataByUrl(url)
}

function loadCityDataByCoords(latitude, longitude){
	var url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
	return loadCityDataByUrl(url)
}

function loadCityDataByUrl(url){
	var xhr = new XMLHttpRequest()
	xhr.open('GET', url, false)
	xhr.send();
	console.log(xhr.status)
	if (xhr.status != 200){
		alert("При обращении к API возникла ошибка, может быть такой город не существует.")
		return
	}
	weatherState = JSON.parse(xhr.response)	
	return weatherState
}

function convertWind(wind){
	var speed = ` ${wind.speed} м/с`
	if (wind.deg > 337.5) return `N ${speed}`
    if (wind.deg> 292.5) return `NW ${speed}`
    if (wind.deg > 247.5) return `W ${speed}`
    if (wind.deg > 202.5) return `SW ${speed}`
    if (wind.deg > 157.5) return `S ${speed}`
    if (wind.deg> 122.5) return `SE ${speed}`
    if (wind.deg > 67.5) return `E ${speed}`
    if (wind.deg > 22.5) return `NE ${speed}`
    return `N ${speed}`
}


function createFavoriteCity(weatherState, list){
	var template = document.getElementsByClassName("favorite_city_template")[0]
	var newFavoriteCity = template.content.cloneNode(true)
	var li = newFavoriteCity.childNodes[1]
	if (weatherState == null){
		return false
	}

	var city = weatherState.name
	newFavoriteCity.querySelector('#favorite_city_name').textContent = city
	newFavoriteCity.querySelector('#favorite_city_temperature').textContent = Math.round(weatherState.main.temp) + "°C"
	newFavoriteCity.querySelector('#wind').textContent = convertWind(weatherState.wind)
	newFavoriteCity.querySelector('#cloudiness').textContent = weatherState.clouds.all + "%"
	newFavoriteCity.querySelector('#pressure').textContent = weatherState.main.pressure + " hPa"
	newFavoriteCity.querySelector('#humidity').textContent = weatherState.main.humidity + "%"
	newFavoriteCity.querySelector('#coords').textContent = `[${weatherState.coord.lon}, ${weatherState.coord.lat}]`
	
	newFavoriteCity.querySelector('#weather_icon').src = `https://openweathermap.org/img/wn/${weatherState.weather[0].icon}.png`
	

	li.getElementsByClassName("remove_button")[0].onclick = function(){
		document.getElementsByClassName("favorite_cities")[0].removeChild(li)
		removeCityFromStorage(city)
	}

	list.appendChild(newFavoriteCity)
	return true
}

function fillMainCity(weatherState){
	var mainCity = document.getElementsByClassName("current_location")[0]

	mainCity.querySelector('#main_city_name').textContent = weatherState.name
	mainCity.querySelector('#temperature').textContent = Math.round(weatherState.main.temp) + "°C"
	mainCity.querySelector('#wind').textContent = convertWind(weatherState.wind)
	mainCity.querySelector('#cloudiness').textContent = weatherState.clouds.all + "%"
	mainCity.querySelector('#pressure').textContent = weatherState.main.pressure + " hPa"
	mainCity.querySelector('#humidity').textContent = weatherState.main.humidity + "%"
	mainCity.querySelector('#coords').textContent = `[${weatherState.coord.lon}, ${weatherState.coord.lat}]`
	
	mainCity.querySelector('#weather_icon').src = `https://openweathermap.org/img/wn/${weatherState.weather[0].icon}@4x.png`
}


function getCitiesFromStorage(){
	if (localStorage.favorite_cities === undefined || localStorage.favorite_cities === ""){
		return []
	}
	return JSON.parse(localStorage.favorite_cities)
}

function saveCitiesToStorage(cities){
	localStorage.setItem("favorite_cities", JSON.stringify(cities))
}

function addCityToStorage(city){
	cities = getCitiesFromStorage()
	cities.push(city)
	saveCitiesToStorage(cities)
}

function removeCityFromStorage(city){
	cities = getCitiesFromStorage()
	index = cities.indexOf(city)
	cities.splice(index, 1)
	saveCitiesToStorage(cities)
}

function addCity(city){
	city = city.toLowerCase()
	city = city.charAt(0).toUpperCase() + city.slice(1)

	if (getCitiesFromStorage().includes(city)){
		alert(city + " уже есть")
		return
	}

	if (createFavoriteCity(loadCityDataByName(city), document.getElementsByClassName("favorite_cities")[0])){
		addCityToStorage(city)
	}
}

function updateLocation(){
	navigator.geolocation.getCurrentPosition(function(pos){
		fillMainCity(loadCityDataByCoords(pos.coords.latitude, pos.coords.longitude))
	},
	function(pos){
		fillMainCity(loadCityDataByCoords(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon))
	})
}

window.onload = function(){ 
	document.getElementsByClassName("add_city")[0].addEventListener('submit', event => {
        event.preventDefault()
    })

	document.getElementsByClassName("add_button")[0].onclick = function(){
		addCity(document.getElementsByClassName("new_city")[0].value)
	}

	updateLocation()
	
	document.getElementsByClassName("update_location")[0].onclick = function(){
		updateLocation()
	}
	


	let cities = getCitiesFromStorage()
	for (var city of cities){
		createFavoriteCity(loadCityDataByName(city), document.getElementsByClassName("favorite_cities")[0])
	}
}

