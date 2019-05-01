
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5nZWxpY2FraW0yOCIsImEiOiJjajg0dW95ZzYwZXU0MnFzNXlrdXRjdTg1In0.weV0JEvwfGOD-05H2x8EAw';
var map = new mapboxgl.Map({
    container: 'map',
    //style: 'mapbox://styles/mapbox/dark-v10',
    style: 'mapbox://styles/mapbox/light-v10',
    //center: [-75.1652,39.9526],
    center: [-75.190328, 39.934581],

    zoom: 14
});




//Points (clusters)

map.on('load', function() {
    // Add a new source from our GeoJSON data and set the
    map.addSource("illegalRentals", {
        type: "geojson",
        // Point to GeoJSON data. Violations Model Example (kim 04/17)
        ////data: "https://raw.githubusercontent.com/angelicakim28/PhillyRentals/master/violations_sample3.geojson",
        data: "https://raw.githubusercontent.com/angelicakim28/PhillyRentals/master/graysferry3.geojson"
    });


//color points using data-driven circle colors

// filters for classifying risk_score into five categories based on risk score
//var risk0 = ["<", ["get", "risk_score"], 0.1];
var risk0 = ["all", [">=", ["get", "risk_score"], -2], ["<", ["get", "risk_score"], 0.1]];

var risk1 = ["all", [">=", ["get", "risk_score"], 0.1], ["<", ["get", "risk_score"], 0.2]];
var risk2 = ["all", [">=", ["get", "risk_score"], 0.2], ["<", ["get", "risk_score"], 0.3]];
var risk3 = ["all", [">=", ["get", "risk_score"], 0.3], ["<", ["get", "risk_score"], 0.4]];
var risk4 = ["all", [">=", ["get", "risk_score"], 0.4], ["<", ["get", "risk_score"], 0.5]];
var risk5 = ["all", [">=", ["get", "risk_score"], 0.5], ["<", ["get", "risk_score"], 0.6]];
var risk6 = ["all", [">=", ["get", "risk_score"], 0.6], ["<", ["get", "risk_score"], 0.7]];
var risk7 = ["all", [">=", ["get", "risk_score"], 0.7], ["<", ["get", "risk_score"], 0.8]];
var risk8 = ["all", [">=", ["get", "risk_score"], 0.8], ["<", ["get", "risk_score"], 0.9]];

var risk9 = [">=", ["get", "risk_score"], 0.9];

// colors to use for the categories
var colors = ['#F9B4BA', '#F790AE', '#F67EA8', '#F56BA1', '#DC4795', '#C32389', '#9E1880','#790D76','#610B6F','#480968'];


//opening page - placeholders
var filter_year = ['<=', "year2", 3000];
var filter_month = ['<=', "month2", 13];
var filter_score = [">=", "risk_score", -1];


    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'illegalRentals',
        filter: ['all', filter_year, filter_month, filter_score],
        paint: {
            // color circles by year_built_copy, using a match expression
            "circle-color": ["case",
                risk0, colors[0],
                risk1, colors[1],
                risk2, colors[2],
                risk3, colors[3],
                risk4, colors[4],
                risk5, colors[5],
                risk6, colors[6],
                risk7, colors[7],
                risk8, colors[8],
                risk9, colors[9], "#0B6623"
            ],
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
            //"circle-opacity":0.3
        }
    });





    // inspect a unit (unclustered-point) on click
    // When a click event occurs on a feature in the unclustered-point layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'unclustered-point', function (e) {
           var coordinates = e.features[0].geometry.coordinates.slice();
           var description = "<b>OPA Account:</b> " + e.features[0].properties.parcel_number;
           description += "<br><b>Relative Risk Score:</b> " + e.features[0].properties.risk_score;
           description += "<br><b>Time Since Last License:</b> " + e.features[0].properties.timesincelast_lic;
           description += "<br><b>Offsite Landlord:</b> " + e.features[0].properties.landlord_status;
           description += "<br><b>Count of Past Violations:</b> " + e.features[0].properties.other_violations2;
           //description += "<br>Active Case: " + e.features[0].properties.active_case_y;
           description += "<br><b>Total Area:</b> " + e.features[0].properties.total_area;
           description += "<br><b>History of Violations:</b> " + e.features[0].properties.hist_violations;


           //add other elements/ fix into scrollable menu

           // Ensure that if the map is zoomed out such that multiple copies of the feature are visible,
           // the popup appears over the copy being pointed to.
           while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
               coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
           }

           new mapboxgl.Popup()
               .setLngLat(coordinates)
               .setHTML(description)
               .addTo(map);
    });

    map.on('mouseenter', 'unclustered-point', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', function () {
        map.getCanvas().style.cursor = '';
    });



// Relative Risk Score Slider
function filterBy(score) {
    filter_score = [">=", "risk_score", score/100];
    map.setFilter('unclustered-point', ['all', filter_year, filter_month, filter_score]);
  }

// Set filter to first all risk scores greater than 0.2
filterBy(0.0);
document.getElementById('slider1').addEventListener('input', function(e) {
    filterBy(e.target.value);
});



// Inspection Date Slider (https://docs.mapbox.com/help/tutorials/show-changes-over-time/)

//Year Slider
document.getElementById('slider2').addEventListener('input', function(e) {
  var year = parseInt(e.target.value);
  // update the map
  filter_year = ['<=', "year2", year];
  map.setFilter('unclustered-point', ['all', filter_year, filter_month, filter_score]);

  console.log(filter_year);
  // update text in the UI
  document.getElementById('idyear').innerText = year;
});


//Month Slider-Combined
document.getElementById('slider3').addEventListener('input', function(e) {
  var month = parseInt(e.target.value);
  // update the map
  filter_month = ['<=', "month2", month];
  map.setFilter('unclustered-point', ['all', filter_year, filter_month, filter_score]);

  console.log(filter_month);
  // update text in the UI
  document.getElementById('idmonth').innerText = month;
});


map.on('moveend', function(e) {
    var features = map.queryRenderedFeatures({layers:['unclustered-point']});

    if (features) {
        var uniqueFeatures = getUniqueFeatures(features, "risk_score");
        // Populate features for the listing overlay.
        renderListings(uniqueFeatures);

        // Clear the input container
        filterEl.value = '';

        // Store the current features in sn `airports` variable to
        // later use for filtering on `keyup`.
        airports = uniqueFeatures;

        // Create array of probabilities
        risk_scoreArr = airports.map(function(element) {
          return element.properties.risk_score;
        });

        var x = risk_scoreArr;

        var trace = {
          x: x,
          type: 'histogram',
          marker: {
            color: "rgba(255, 100, 102, 0.7)",
          },
          opacity: 0.5,
          xbins: {
            start: 0,
            end: 1,
            size: 0.05
          },
        };


        var data = [trace];
        //var data = [trace, trace_thresholdline];

        var layout = {
          barmode: "overlay",
          xaxis: {title: "Score"},
          yaxis: {title: "Count"},
          showlegend: false,
          shapes: [
               {
                   type: 'line',
                   xref: 'paper',
                   x0: 0.65,
                   y0: 0,
                   x1: 0.65,
                   y1: 10, // myDiv.layout.yaxis.range[1],
                   line:{
                       color: 'rgba(72,9,104, 0.8)',
                       width: 1,
                       dash:'dot'
                   }
                 }
               ]
        };
        //Plotly.newPlot('myDiv', data, layout, {showSendToCloud: true});
        var myplot = Plotly.newPlot('myDiv', data, layout, {showSendToCloud: true});
            myplot.then(function(plot) {
              var layout_update = { 'shapes[0].y1': plot.layout.yaxis.range[1] };
              Plotly.update('myDiv', {}, layout_update);
              //console.log(plot.layout.yaxis.range[1]);
            });
            myplot;


    }
});


filterEl.addEventListener('keyup', function(e) {
    var value = normalize(e.target.value);

    // Filter visible features that don't match the input value.
    var filtered = airports.filter(function(feature) {
        var name = normalize(feature.properties.risk_score);
        var code = normalize(feature.properties.risk_score);

        return name.indexOf(value) > -1 || code.indexOf(value) > -1;
    });

    // Populate the sidebar with filtered results
    renderListings(filtered);

    // Set the filter to populate features into the layer.
    map.setFilter('unclustered-point', ['match', ['get', 'risk_score'], filtered.map(function(feature) {
        return feature.properties.risk_score;
    }), true, false]);
});

// Call this function on initialization
// passing an empty array to render an empty state
renderListings([]);


//changed geojson file
//changed risk_score to risk_score


























//closing for map.on (points (clusters))
});










//











//
