let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


//read in data

d3.json(geoData).then(function(data) {
    createFeatures(data.features); 
});

//create the data points
function createFeatures(data) {

    //modifies and creates the popups
    function onEachFeature(feature,layer) {
        layer.bindPopup(
            `<h3>${feature.properties.place}</h3><hr>
            <p>Date: ${new Date(feature.properties.time)}</p>
            <p>Magnitude: ${feature.properties.mag} mwr</p>
            <p>Coordinates: ${feature.geometry.coordinates[2]} km</p>
            <p>More Info URL: <a href="${feature.properties.url}" target="_blank">Click here</a></p> `)
    };

    //modifies the data points to be circles
    function pointToLayer(feature, latlng) {
        //call function to determine the fill color of the data points
        let color = getColor(feature.geometry.coordinates[2]) //color is based off of depth of the earthquake
        //defines circle marker
        return L.circleMarker(latlng, {
                    radius: feature.properties.mag *3, //change to desired scale
                    fillColor: color,
                    color: '#000',
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
    };

    //function to define fill color based on depth
    function getColor(depth) {
        let colors = [
            "#e6e6ff", "#b3b3ff", "#9999ff", "#6666ff", "#3333ff", "#0000cc"]

        //return color based on depth 
        if (depth < 10) {
            return colors[0]
        }
        else if (depth < 20) {
            return colors[1]
        }
        else if (depth < 50) {
            return colors[2]
        }
        else if (depth < 75) {
            return colors[3]
        }
        else if (depth < 100) {
            return colors[4]
        }
        else {
            return colors[5]
        }
    };

    //call functions
    let earthquakes = L.geoJSON(data, {
        pointToLayer: pointToLayer,
        onEachFeature: onEachFeature
        
    });

    //create map
    createMap(earthquakes);
};

function createMap(eqData) {

    //base layer
    let baseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    });

    //create overlays
    let overLayMaps = {
        Earthquakes: eqData
    }

    //define layers
    let baseMaps = {
        "Base Map": baseLayer
    }

    //define map
    let myMap = L.map("map", {
        center: [39.983160, -101.734474],
        zoom: 5,
        layers: [baseLayer, eqData]
      });
    
    //define control for layers and overlays
    L.control.layers(baseMaps, overLayMaps, {
        collapsed:false
    }).addTo(myMap);

    //creates the legend

    let legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let depthLabels = ['<10 km', '10-20 km', '20-50 km', '50-75 km', '75-100 km', '100+ km'];
        let colors = ["#e6e6ff", "#b3b3ff", "#9999ff", "#6666ff", "#3333ff", "#0000cc"];

        // Add a label to the legend
        div.innerHTML = '<strong>Depth Scale:</strong><br>';

        // Loop through the legend labels and colors
        for (let i = 0; i < depthLabels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '; width: 20px; height: 20px;"></i> ' +
                depthLabels[i] + '<br>';
        }
        return div;
    };
    legend.addTo(myMap);

    //add a title to the map
    let titleControl = L.control({ position: 'topleft' });

    // Function to generate the HTML for the title
    titleControl.onAdd = function (myMap) {
        let div = L.DomUtil.create('div', 'map-title');
        div.innerHTML = '<h2>Earthquakes: Last Week</h2>';
        return div;
    };
    titleControl.addTo(myMap);
};


