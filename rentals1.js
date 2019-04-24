
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5nZWxpY2FraW0yOCIsImEiOiJjajg0dW95ZzYwZXU0MnFzNXlrdXRjdTg1In0.weV0JEvwfGOD-05H2x8EAw';
var map = new mapboxgl.Map({
    container: 'map',
    //style: 'mapbox://styles/mapbox/dark-v10',
    style: 'mapbox://styles/mapbox/light-v10',
    //center: [-75.1652,39.9526],
    center: [-75.194147, 39.934481],
    zoom: 13
});




//Clusters

map.on('load', function() {
    // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true. GL-JS will add the point_count property to your source data.
    map.addSource("illegalRentals", {
        type: "geojson",
        // Point to GeoJSON data. Violations Model Example (kim 04/17)
        data: "https://raw.githubusercontent.com/angelicakim28/PhillyRentals/master/violations_sample3.geojson",
        //cluster: true,
        //clusterMaxZoom: 14, // Max zoom to cluster points on
        //clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    // map.addLayer({
    //     id: "clusters",
    //     type: "circle",
    //     source: "illegalRentals",
    //     filter: ["has", "point_count"],
    //     paint: {
    //         // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
    //         // with three steps to implement three types of circles:
    //         //   * Blue, 20px circles when point count is less than 100
    //         //   * Yellow, 30px circles when point count is between 100 and 750
    //         //   * Pink, 40px circles when point count is greater than or equal to 750
    //         "circle-color": [
    //             "step",
    //             ["get", "point_count"],
    //             "#51bbd6",
    //             100,
    //             "#f1f075",
    //             750,
    //             "#f28cb1"
    //         ],
    //         "circle-radius": [
    //             "step",
    //             ["get", "point_count"],
    //             20,
    //             100,
    //             30,
    //             750,
    //             40
    //         ]
    //     }
    // });
    //
    // map.addLayer({
    //     id: "cluster-count",
    //     type: "symbol",
    //     source: "illegalRentals",
    //     filter: ["has", "point_count"],
    //     layout: {
    //         "text-field": "{point_count_abbreviated}",
    //         "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    //         "text-size": 12
    //     }
    // });


//color points using data-driven circle colors

// filters for classifying classProbs into five categories based on risk score
var risk1 = ["<", ["get", "classProbs"], 0.2];
var risk2 = ["all", [">=", ["get", "classProbs"], 0.2], ["<", ["get", "classProbs"], 0.3]];
var risk3 = ["all", [">=", ["get", "classProbs"], 0.3], ["<", ["get", "classProbs"], 0.4]];
var risk4 = ["all", [">=", ["get", "classProbs"], 0.4], ["<", ["get", "classProbs"], 0.5]];
var risk5 = [">=", ["get", "classProbs"], 0.5];

// colors to use for the categories
var colors = ['#f9e5f9', '#c59ec4', '#ac669a', '#70577b', '#483466'];

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



// // Inspection Date Filter (CALENDAR)
// function filterByDate(datadate) {
//
//     console.log(datadate);
//
//     var filter_year = ["<=", "year", parseInt(datadate.substring(0,4))];
//     var filter_month = ["<=", "month", parseInt(datadate.substring(5,7))];
//     var filter_day = ["<=", "day", parseInt(datadate.substring(8,10))];
//
//     console.log(parseInt(datadate.substring(1,4)),parseInt(datadate.substring(5,7)));
//
//     map.setFilter('unclustered-point', ["all", filter_year, filter_month, filter_day]);
//   }
//
//   document.getElementById('filterdate-button').addEventListener('click', function() {
//       filterByDate(document.getElementById('dateselection').value);
//   });


});











//
