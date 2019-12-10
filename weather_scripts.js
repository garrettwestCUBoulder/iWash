function weatherBalloon( cityZIP ) {
  var key = '{yourkey}';
  fetch('https://api.openweathermap.org/data/2.5/weather?zip=' + cityZIP+ '&appid=' + "f13d8c523b86e058f40d4b5332b9edca")
  .then(function(resp) { return resp.json() }) // Convert data to json
  .then(function(data) {
    drawWeather(data);
  })
  .catch(function() {
    // catch any errors
  });
}

window.onload = function() {
  var zip = window.prompt("Enter your ZIP: ");
  alert("Your ZIP is " + zip);
  weatherBalloon(zip);
}

function drawWeather( d ) {
	var min_celcius = Math.round(parseFloat(d.main.temp_min)-273.15);
  var max_celcius = Math.round(parseFloat(d.main.temp_max)-273.15);

  document.getElementById('main').innerHTML = d.weather[0].main;
  document.getElementById('description').innerHTML = d.weather[0].description;
	document.getElementById('min_temp').innerHTML = min_celcius + '&deg;';
  document.getElementById('max_temp').innerHTML = max_celcius + '&deg;';
	document.getElementById('location').innerHTML = d.name;
}
