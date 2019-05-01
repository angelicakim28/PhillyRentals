
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5nZWxpY2FraW0yOCIsImEiOiJjajg0dW95ZzYwZXU0MnFzNXlrdXRjdTg1In0.weV0JEvwfGOD-05H2x8EAw';
var map = new mapboxgl.Map({
    container: 'map',
    //style: 'mapbox://styles/mapbox/dark-v10',
    style: 'mapbox://styles/mapbox/light-v10',
    //center: [-75.1652,39.9526],
    center: [-75.160328, 39.934481],

    zoom: 13
});




//Points (clusters)

map.on('load', function() {
    // Add a new source from our GeoJSON data and set the
    map.addSource("illegalRentals", {
        type: "geojson",
        // Point to GeoJSON data. Violations Model Example (kim 04/17)
        data: "https://raw.githubusercontent.com/angelicakim28/PhillyRentals/master/violations_sample3.geojson",
    });


//color points using data-driven circle colors

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
        id: 'unclustered-point',
        type: 'circle',
        source: 'illegalRentals',
        filter: ['all', filter_year, filter_month, filter_score],
        paint: {
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
            //"circle-opacity":0.3
        }
    });





    // inspect a unit (unclustered-point) on click
    // When a click event occurs on a feature in the unclustered-point layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'unclustered-point', function (e) {
           var coordinates = e.features[0].geometry.coordinates.slice();
           var description = e.features[0].properties.MAPNAME;
           description += "<br>Relative Risk Score: " + e.features[0].properties.classProbs;
           description += "<br>Time Since Last License: " + e.features[0].properties.timesincelast_lic;
           description += "<br>Offsite Landlord: " + e.features[0].properties.offsite_landlord;
           description += "<br>History of Violations: " + e.features[0].properties.other_violations2;
           description += "<br>Active Case: " + e.features[0].properties.active_case_y;
           description += "<br>Total Area: " + e.features[0].properties.total_area_copy;
           description += "<br>Last Inspection Date: " + e.features[0].properties.testdate;


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
    filter_score = [">=", "classProbs", score/100];
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
  filter_year = ['<=', "year", year];
  map.setFilter('unclustered-point', ['all', filter_year, filter_month, filter_score]);

  console.log(filter_year);
  // update text in the UI
  document.getElementById('idyear').innerText = year;
});


//Month Slider-Combined
document.getElementById('slider3').addEventListener('input', function(e) {
  var month = parseInt(e.target.value);
  // update the map
  filter_month = ['<=', "month", month];
  map.setFilter('unclustered-point', ['all', filter_year, filter_month, filter_score]);

  console.log(filter_month);
  // update text in the UI
  document.getElementById('idmonth').innerText = month;
});


map.on('moveend', function(e) {
    var features = map.queryRenderedFeatures({layers:['unclustered-point']});

    if (features) {
        var uniqueFeatures = getUniqueFeatures(features, "classProbs");
        // Populate features for the listing overlay.
        renderListings(uniqueFeatures);

        // Clear the input container
        filterEl.value = '';

        // Store the current features in sn `airports` variable to
        // later use for filtering on `keyup`.
        airports = uniqueFeatures;

        // Create array of probabilities
        probsArr = airports.map(function(element) {
          return element.properties.classProbs;
        });

        var x = probsArr;

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

        // var trace_thresholdline = {
        //   type:'line',
        //   x0: 0.65,
        //   y0: 0,
        //   x1: 0.65,
        //   y1: 2,
        //   line: {
        //     color:"rgba(72,9,104, 0.8)",
        //     width:0.1,
        //   },
        //   xbins:{
        //     start: 0,
        //     end: 1,
        //     size: 0.01
        //   },
        // };

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
        var name = normalize(feature.properties.classProbs);
        var code = normalize(feature.properties.classProbs);

        return name.indexOf(value) > -1 || code.indexOf(value) > -1;
    });

    // Populate the sidebar with filtered results
    renderListings(filtered);

    // Set the filter to populate features into the layer.
    map.setFilter('unclustered-point', ['match', ['get', 'classProbs'], filtered.map(function(feature) {
        return feature.properties.classProbs;
    }), true, false]);
});

// Call this function on initialization
// passing an empty array to render an empty state
renderListings([]);


// // Histogram
//       var x1 = [];
//       var x2 = [];
//       var y1 = [];
//       var y2 = [];
//       for (var i = 1; i < 500; i++)
//       {
//       	k=Math.random();
//       	x1.push(k*5);
//       	x2.push(k*10);
//       	y1.push(k);
//       	y2.push(k*2);
//       }
//       var trace1 = {
//         x: x1,
//         y: y1,
//         name: 'control',
//         autobinx: false,
//         histnorm: "count",
//         marker: {
//           color: "rgba(195, 35, 137, 0.7)",
//           line: {
//             color:  "rgba(121, 13, 118, 1)",
//             width: 1
//           }
//         },
//         opacity: 0.5,
//         type: "histogram",
//         xbins: {
//           end: 2.8,
//           size: 0.06,
//           start: 0.5
//         }
//       };
//
//       var data = [trace1];
//       var layout = {
//         bargap: 0.05,
//         bargroupgap: 0.2,
//         barmode: "overlay",
//         title: "Relative Risk Score Distribution",
//         xaxis: {title: "Risk Score Value"},
//         yaxis: {title: "Count/Frequency"}
//       };
//       Plotly.newPlot('myDiv', data, layout, {showSendToCloud: true});





























//closing for map.on (points (clusters))
});










//











//
