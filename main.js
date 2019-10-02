//checkInput();
//createGeoJSON();
//addMapwithGeoJson(extGeojson);

//Load external navbar.html
includeHTML();

//Execute function after pressing the return key
document.querySelector("#textareabox").addEventListener("keyup", event => {
  event.preventDefault();
  if (event.key !== "Enter") return;
  checkInput();
});

//Check, if the input is either a GeoJSON, a GeoJSON from Wikimedia Commons with an extra "data" property, a mapmask or none of the 3 and thus invalid
function checkInput() {
  purge();
  var input = document.getElementById("textareabox").value;
  var myObj;

  if (input.includes("FeatureCollection") && input.includes("data")) {
    console.log("GeoJSON from Commons!");
    myObj = JSON.parse(input).data;
    document.getElementById("mapheading").innerHTML = "<h2>Select area of which to create mapmask</h2>"
    addMapwithGeoJson(myObj);
  } else if (input.includes("FeatureCollection")) {
    console.log("Standard GeoJSON!");
    myObj = JSON.parse(input);
    document.getElementById("mapheading").innerHTML = "<h2>Select area of which to create mapmask</h2>"
    addMapwithGeoJson(myObj);
  } else if (input.includes("Mapmask")) {
    console.log("Mapmask!");
    createGeoJSON(input);
  } else {
    var error = "<h2>Input not valid!</h2>";
    document.getElementById("mapid").innerHTML = error;
  }
}

function addMapwithGeoJson(distrGeoJson) {
  //Add a Leaflet map to the page
  var mymap = L.map('mapid').setView([0, 0], 11);

  L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    maxZoom: 18
  }).addTo(mymap);

  var jsonLayer = L.geoJSON(distrGeoJson, {
    onEachFeature: onEachFeature,
    //Color the Leaflet map similar to the GeoJSON
    style: function (feature) {
      color = feature.properties.fill;
      console.log(color);
      return { "fillColor": color, "opacity": 1, "fillOpacity": 0.7, "color": "#555555", "weight": 2 };
    }

  })
  //Add the JSON layer to the map
  jsonLayer.addTo(mymap);
  //Center and zoom the map on the provided GeoJSON
  mymap.fitBounds(jsonLayer.getBounds());

  //Start the conversion to a mapmask, if a feature (e.g. a district) is clicked.
  function onEachFeature(feature, layer) {
    //bind click
    layer.on('click', function (e) {
      //e=event
      //console.log(e);
      //console.log(feature.properties.title);
      //console.log("Anzahl der Koordinaten: " +feature.geometry.coordinates[0].length);
      //console.log("Hier sind die Koordinaten gespeichert: " +feature.geometry.coordinates[0][0][0]);
      createMapmask(feature);
    });
  }
}

function createMapmask(myObj) {
  var coordinates = myObj.geometry.coordinates[0];
  var mapmask = "{{Mapmask|";

  for (var i = 0; i < coordinates.length - 1; i++) {
    mapmask += coordinates[i][1].toFixed(4) + "," + coordinates[i][0].toFixed(4) + "|";
  }
  mapmask += coordinates[coordinates.length - 1][1].toFixed(4) + "," + coordinates[coordinates.length - 1][0].toFixed(4) + "}}";
  //console.log(mapmask);

  var outputTextarea = "<h2>Result</h2><h3>Mapmask for <i>" + myObj.properties.title + "</i></h2> <textarea id=textareabox cols=150 rows=30 readonly>" + mapmask + "</textarea>";
  document.getElementById("outputCode").innerHTML = outputTextarea;

  //Scroll to map heading so user doesn't have to do it manually
  document.getElementById("mapheading").scrollIntoView();
}

function createGeoJSON(input) {
  //var input=mapmask;
  //var input = document.getElementById("textareabox").value;
  var begCutPoint = input.indexOf("|");
  var endCutPoint = input.indexOf("}");
  var mapmaskString = input.substring(begCutPoint + 1, endCutPoint);
  var mapmaskTempArray = mapmaskString.split("|");
  var mapmaskArray = [];

  for (var i = 0; i < mapmaskTempArray.length; i++) {
    mapmaskArray.push(mapmaskTempArray[i].split(","));
  }
  var output = '{"type": "FeatureCollection","features": [{"type": "Feature","properties": {},"geometry": {"type": "Polygon","coordinates": [[';
  for (var i = 0; i < mapmaskArray.length - 1; i++) {
    output += "[" + mapmaskArray[i][1] + "," + mapmaskArray[i][0] + "],";
  }

  output += "[" + + mapmaskArray[mapmaskArray.length - 1][1] + "," + mapmaskArray[mapmaskArray.length - 1][0] + "]]]}}]}";
  var outputTextarea = "<h2>Result</h2><h3>Mapmask converted to GeoJSON</h3><textarea id=textareabox cols=110 rows=30 readonly>" + output + "</textarea>";
  document.getElementById("outputCode").innerHTML = outputTextarea;
  addMapwithGeoJson(JSON.parse(output));
  //Scroll to map heading so user doesn't have to do it manually
  document.getElementById("mapheading").scrollIntoView();
}

function purge() {
  //Replace current map container ("mapid") with an empty one. Else Leaflet error "container already intitialized", when 2nd map loaded.
  var newdiv = document.createElement("div");
  newdiv.setAttribute("id", "mapid");
  var oldDiv = document.getElementById("mapid");
  var mainBody=document.querySelector("main");
  mainBody.replaceChild(newdiv, oldDiv);

  //Purge the content of all div and p elements.
  document.getElementById("mapheading").innerHTML = "";
  document.getElementById("mapid").innerHTML = "";
  document.getElementById("outputCode").innerHTML = "";

  //Set the height of the "mapid" container only here, so that the "Help" link isn't out of view for the user, when loading the page.
  var mapHeight = document.querySelector("#mapid");
  mapHeight.style.setProperty("height", "400px");
}

//Copy example GeoJSON/Mapmask into text area
function copyToTextarea(clickedId) {
  var input;
  if (clickedId == "exampleGeoJson") {
    //console.log("Beispiel GeoJSON!");
    input = JSON.stringify(exampleGeojson);
  } else {
    //console.log("Beispiel Mapmask!");
    input = exampleMapmask;
  }
  document.getElementById("textareabox").value = input;
  //Scroll to "textareabox" so user doesn't have to do it manually
  document.getElementById("textareabox").scrollIntoView();
}

//Code to load the external navbar.html
function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function () {
        if (this.readyState == 4) {
          if (this.status == 200) { elmnt.innerHTML = this.responseText; }
          if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}