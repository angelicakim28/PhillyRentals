

// Holds visible airport features for filtering
var airports = [];

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
            // item.textContent = prop.risk_score;
            item.textContent = prop.risk_score;
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
        map.setFilter('unclustered-point', ['has', 'risk_score']);
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

// map.on('load', function() {
//
//     map.addSource("illegalRentals", {
//         type: "geojson",
//         // Point to GeoJSON data. Violations Model Example (kim 04/17)
//         data: "https://raw.githubusercontent.com/angelicakim28/PhillyRentals/master/violations_sample3.geojson",
//     });
//
//     // filters for classifying risk_score into five categories based on risk score
//     var risk1 = ["<", ["get", "risk_score"], 0.2];
//     var risk2 = ["all", [">=", ["get", "risk_score"], 0.2], ["<", ["get", "risk_score"], 0.3]];
//     var risk3 = ["all", [">=", ["get", "risk_score"], 0.3], ["<", ["get", "risk_score"], 0.4]];
//     var risk4 = ["all", [">=", ["get", "risk_score"], 0.4], ["<", ["get", "risk_score"], 0.5]];
//     var risk5 = [">=", ["get", "risk_score"], 0.5];
//
//     // colors to use for the categories
//     var colors = ['#F9B4BA', '#F56BA1' , '#C32389', '#790D76', '#480968'];
//
//     //opening page - placeholders
//     var filter_year = ['<=', "year", 3000];
//     var filter_month = ['<=', "month", 13];
//     var filter_score = [">=", "risk_score", -1];
//
//     map.addLayer({
//         "id": 'unclustered-point',
//         "source": "illegalRentals",
//         "type": 'circle',
//         "paint": {
//             // color circles by year_built_copy, using a match expression
//             "circle-color": ["case",
//                 risk1, colors[0],
//                 risk2, colors[1],
//                 risk3, colors[2],
//                 risk4, colors[3],
//                 risk5, colors[4], "#0B6623"
//             ],
//             "circle-radius": 4,
//             "circle-stroke-width": 1,
//             "circle-stroke-color": "#fff"
//         }
//     });
//
//     map.on('moveend', function(e) {
//         var features = map.queryRenderedFeatures({layers:['unclustered-point']});
//
//         if (features) {
//             var uniqueFeatures = getUniqueFeatures(features, "risk_score");
//             // Populate features for the listing overlay.
//             renderListings(uniqueFeatures);
//
//             // Clear the input container
//             filterEl.value = '';
//
//             // Store the current features in sn `airports` variable to
//             // later use for filtering on `keyup`.
//             airports = uniqueFeatures;
//
//             // Create array of probabilities
//             risk_scoreArr = airports.map(function(element) {
//               return element.properties.risk_score;
//             });
//
//             var x = risk_scoreArr;
//
//             var trace = {
//               x: x,
//               type: 'histogram',
//               marker: {
//                 color: "rgba(255, 100, 102, 0.7)",
//               },
//               opacity: 0.5
//             };
//             var data = [trace];
//             var layout = {
//               barmode: "overlay",
//               title: "Sample Histogram",
//               xaxis: {title: "Score"},
//               yaxis: {title: "Count"}
//             };
//             Plotly.newPlot('myDiv', data, layout, {showSendToCloud: true});
//
//
//         }
//     });
//
//
//     filterEl.addEventListener('keyup', function(e) {
//         var value = normalize(e.target.value);
//
//         // Filter visible features that don't match the input value.
//         var filtered = airports.filter(function(feature) {
//             var name = normalize(feature.properties.risk_score);
//             var code = normalize(feature.properties.risk_score);
//
//             return name.indexOf(value) > -1 || code.indexOf(value) > -1;
//         });
//
//         // Populate the sidebar with filtered results
//         renderListings(filtered);
//
//         // Set the filter to populate features into the layer.
//         map.setFilter('unclustered-point', ['match', ['get', 'risk_score'], filtered.map(function(feature) {
//             return feature.properties.risk_score;
//         }), true, false]);
//     });
//
//     // Call this function on initialization
//     // passing an empty array to render an empty state
//     renderListings([]);
//
//
// });









//
