
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5nZWxpY2FraW0yOCIsImEiOiJjajg0dW95ZzYwZXU0MnFzNXlrdXRjdTg1In0.weV0JEvwfGOD-05H2x8EAw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    //center: [-98, 38.88],
    center: [-75.160328, 39.934481],
    //maxZoom: 5,
    //minZoom: 1,
    zoom: 13
});

// Holds visible airport features for filtering
var airports = [];

// // Create a popup, but don't add it to the map yet.
// var popup = new mapboxgl.Popup({
//     closeButton: false
// });

var filterEl = document.getElementById('feature-filter');
var listingEl = document.getElementById('feature-listing');

function renderListings(features) {
    // Clear any existing listings
    listingEl.innerHTML = '';
    if (features.length) {
        features.forEach(function(feature) {
            var prop = feature.properties;
            // var item = document.createElement('a');
            var item = document.createElement('a');
            //item.href = prop.wikipedia;
            item.target = '_blank';
            // item.textContent = prop.MAPNAME;
            item.textContent = prop.MAPNAME;
            item.addEventListener('mouseover', function() {
                // Highlight corresponding feature on the map
                popup.setLngLat(feature.geometry.coordinates)
                    .setText(feature.properties.MAPNAME)
                    .addTo(map);
            });
            listingEl.appendChild(item);
        });

        // Show the filter input
        filterEl.parentNode.style.display = 'block';
    } else {
        var empty = document.createElement('p');
        empty.textContent = 'Drag the map to populate results';
        listingEl.appendChild(empty);

        // Hide the filter input
        filterEl.parentNode.style.display = 'none';

        // remove features filter
        map.setFilter('unclustered-point', ['has', 'MAPNAME']);
    }
}

function normalize(string) {
    return string.trim().toLowerCase();
}

function getUniqueFeatures(array, comparatorProperty) {
    var existingFeatureKeys = {};
    // Because features come from tiled vector data, feature geometries may be split
    // or duplicated across tile boundaries and, as a result, features may appear
    // multiple times in query results.
    var uniqueFeatures = array.filter(function(el) {
        if (existingFeatureKeys[el.properties[comparatorProperty]]) {
            return false;
        } else {
            existingFeatureKeys[el.properties[comparatorProperty]] = true;
            return true;
        }
    });

    return uniqueFeatures;
}

map.on('load', function() {

    map.addSource("illegalRentals", {
        type: "geojson",
        // Point to GeoJSON data. Violations Model Example (kim 04/17)
        data: "https://raw.githubusercontent.com/angelicakim28/PhillyRentals/master/violations_sample3.geojson",
    });

    // filters for classifying classProbs into five categories based on risk score
    var risk1 = ["<", ["get", "classProbs"], 0.2];
    var risk2 = ["all", [">=", ["get", "classProbs"], 0.2], ["<", ["get", "classProbs"], 0.3]];
    var risk3 = ["all", [">=", ["get", "classProbs"], 0.3], ["<", ["get", "classProbs"], 0.4]];
    var risk4 = ["all", [">=", ["get", "classProbs"], 0.4], ["<", ["get", "classProbs"], 0.5]];
    var risk5 = [">=", ["get", "classProbs"], 0.5];

    // colors to use for the categories
    var colors = ['#F9B4BA', '#F56BA1' , '#C32389', '#790D76', '#480968'];

    //opening page - placeholders
    var filter_year = ['<=', "year", 3000];
    var filter_month = ['<=', "month", 13];
    var filter_score = [">=", "classProbs", -1];

    map.addLayer({
        "id": 'unclustered-point',
        "source": "illegalRentals",
        "type": 'circle',
        "paint": {
            // color circles by year_built_copy, using a match expression
            "circle-color": ["case",
                risk1, colors[0],
                risk2, colors[1],
                risk3, colors[2],
                risk4, colors[3],
                risk5, colors[4], "#0B6623"
            ],
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
        }
    });

    map.on('moveend', function() {
        var features = map.queryRenderedFeatures({layers:['unclustered-point']});

        if (features) {
            var uniqueFeatures = getUniqueFeatures(features, "MAPNAME");
            // Populate features for the listing overlay.
            renderListings(uniqueFeatures);

            // Clear the input container
            filterEl.value = '';

            // Store the current features in sn `airports` variable to
            // later use for filtering on `keyup`.
            airports = uniqueFeatures;
        }
    });

    // map.on('mousemove', 'unclustered-point', function(e) {
    //     // Change the cursor style as a UI indicator.
    //     map.getCanvas().style.cursor = 'pointer';
    //
    //     // Populate the popup and set its coordinates based on the feature.
    //     var feature = e.features[0];
    //     popup.setLngLat(feature.geometry.coordinates)
    //         .setText(feature.properties.MAPNAME)
    //         .addTo(map);
    // });
    //
    // map.on('mouseleave', 'unclustered-point', function() {
    //     map.getCanvas().style.cursor = '';
    //     popup.remove();
    // });

    filterEl.addEventListener('keyup', function(e) {
        var value = normalize(e.target.value);

        // Filter visible features that don't match the input value.
        var filtered = airports.filter(function(feature) {
            var name = normalize(feature.properties.MAPNAME);
            var code = normalize(feature.properties.MAPNAME);
            return name.indexOf(value) > -1 || code.indexOf(value) > -1;
        });

        // Populate the sidebar with filtered results
        renderListings(filtered);

        // Set the filter to populate features into the layer.
        map.setFilter('unclustered-point', ['match', ['get', 'MAPNAME'], filtered.map(function(feature) {
            return feature.properties.MAPNAME;
        }), true, false]);
    });

    // Call this function on initialization
    // passing an empty array to render an empty state
    renderListings([]);
});
