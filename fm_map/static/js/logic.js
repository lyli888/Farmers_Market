//Glonally accessible map variable
var myMap;

//Globally Accessible Legend variable
var legend;

//Globally accessible quakeMarkers array
var marketMarkers = [];

//Globally accessible path to CSV
var csvpath = "../data/farmers_market_cleaned.csv";

//Globally accessible path to geojson data
var geojsonpath = "../data/GeoObs2.geojson";


d3.csv(csvpath).then(function(fmdata) {
  // Fill in column names on left, a + on the right for numbers
  fmdata.forEach(function(d) {
    d.y = +d.y;
    d.x = +d.x;
    d.MarketName = d.name;
    d.WIC = d.wic;
    d.Organic = d.organic;
    d.Vegetable = d.vegetable;
    d.Fruits = d.fruit;
    d.Meat = d.meat;
    d.Grains = d.grain;
  });
});

d3.geoJSON(geojsonpath).then(createMarkers());



//Creates & places markers w/ earthquake info, calls createMap
function createMarkers() {

    // Pull data from response
    for (var i = 0; i < response.features.length; i++) {
      var place = response.features[i].properties.place;
    	var mag = response.features[i].properties.mag;
      var date = response.features[i].properties.time;
    	var location = [response.features[i].geometry.coordinates[0], response.features[i].geometry.coordinates[1]];
    	var depth = response.features[i].geometry.coordinates[2];

		  console.log(location);
  
      //Marker With Popup
      var marketMarker = L.marker(location)
      .bindPopup("<h3>" + response.features[i].properties.place + "<h3><h3>Magnitude: " + response.features[i].properties.mag + "</h3>"+ "<h3><h3>Depth: " + response.features[i].geometry.coordinates[2] + "</h3>"+ "<h3><h3>Date: " + response.features[i].properties.time+ "</h3>");
  
      //Markers ==> Array
      marketMarkers.push(marketMarker);

      //
      var quakeCircle = L.circle(location, {
          color: "000000",
          fillColor: quakeColor(depth),
          opacity: 0.50,
          radius: quakeRadius(mag)
      });

      quakeCircles.push(quakeCircle);

    }//End of 1st FOR LOOP through geoJSON response object
    
    // Create layer groups made from markers & circles arrays, pass to & call createMap & addCircles functions
    createMap(L.layerGroup(quakeMarkers));
    addCircles(L.layerGroup(quakeCircles));
} 

//Create Map function
function createMap(markets) {

  // Create the tile layer that will be the background of our map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY
  });

  // Create a baseMaps object to hold the lightmap layer
  var baseMaps = {
    "Light Map": lightmap
  };

  // Create an overlayMaps object to hold the earthquakes layer
  var overlayMaps = {
    "Farmers' Markers": markets,
  };

  // Create the map object with options
  myMap = L.map("map-id", {
    center: [40.73, -74.0059],
    zoom: 12,
    minZoom: 0,
    layers: [lightmap, markets]
  });

  // Create a layer control, pass in the baseMaps, overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}



//Legend
function createLegend(){
  legend = L.control({position: "bottomright"})

  legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'legend'),
      grades = [0, 1, 5, 10, 50, 150],
      labels = ["GREEN", "YELLOW", "ORANGE", "RED", "GREY", "BLACK"]
    // loop through our depth intervals and generate a label for each
    for (var i = 0; i < (grades.length + 1); i++) {
        div.innerHTML +=
            '<i style="background:' + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;'  + grades[i + 1] + ' DEPTH '  + labels[i] + '<br>' : '+' );

    }
    return div;
  };
  legend.addTo(myMap);
}

