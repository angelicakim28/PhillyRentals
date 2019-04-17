
mapboxgl.accessToken = 'pk.eyJ1IjoiYW5nZWxpY2FraW0yOCIsImEiOiJjajg0dW95ZzYwZXU0MnFzNXlrdXRjdTg1In0.weV0JEvwfGOD-05H2x8EAw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    //style: 'mapbox://styles/mapbox/light-v10',
    center: [-75.1652,39.9526],
    zoom: 12
});



//Clusters

map.on('load', function() {
    // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true. GL-JS will add the point_count property to your source data.
    map.addSource("illegalRentals", {
        type: "geojson",
        // Point to GeoJSON data. Violations Model Example (kim 04/17)
        data: "https://raw.githubusercontent.com/angelicakim28/PhillyRentals/master/violations_sample.geojson",
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });

    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "illegalRentals",
        filter: ["has", "point_count"],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            "circle-color": [
                "step",
                ["get", "point_count"],
                "#51bbd6",
                100,
                "#f1f075",
                750,
                "#f28cb1"
            ],
            "circle-radius": [
                "step",
                ["get", "point_count"],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "illegalRentals",
        filter: ["has", "point_count"],
        layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
        }
    });

    map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "illegalRentals",
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-color": "#11b4da",
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
           var description = e.features[0].properties.classProbs;

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

    // map.on('click', 'unclustered-point', function (e) {
    //     var features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
    //     var clusterId = features[0].properties.classProbs;
    //     map.getSource('illegalRentals').getClusterExpansionZoom(clusterId, function (err, zoom) {
    //         if (err)
    //             return;
    //
    //         map.easeTo({
    //             center: features[0].geometry.coordinates,
    //             zoom: zoom
    //         });
    //     });
    // });

    map.on('mouseenter', 'unclustered-point', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', function () {
        map.getCanvas().style.cursor = '';
    });
});













//Time Slider
var months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
];

function filterBy(month) {

    var filters = ['==', 'month', month];
    map.setFilter('earthquake-circles', filters);
    map.setFilter('earthquake-labels', filters);

    // Set the label to the month
    document.getElementById('month').textContent = months[month];
}

map.on('load', function() {

    // Data courtesy of http://earthquake.usgs.gov/
    // Query for significant earthquakes in 2015 URL request looked like this:
    // http://earthquake.usgs.gov/fdsnws/event/1/query
    //    ?format=geojson
    //    &starttime=2015-01-01
    //    &endtime=2015-12-31
    //    &minmagnitude=6'
    //
    // Here we're using d3 to help us make the ajax request but you can use
    // Any request method (library or otherwise) you wish.
    d3.json('https://docs.mapbox.com/mapbox-gl-js/assets/significant-earthquakes-2015.geojson', function(err, data) {
        if (err) throw err;

        // Create a month property value based on time
        // used to filter against.
        data.features = data.features.map(function(d) {
            d.properties.month = new Date(d.properties.time).getMonth();
            return d;
        });

        map.addSource('illegalRentals', {
            'type': 'geojson',
            data: data
        });

        map.addLayer({
            'id': 'earthquake-circles',
            'type': 'circle',
            'source': 'illegalRentals',
            'paint': {
                'circle-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'mag'],
                    6, '#FCA107',
                    8, '#7F3121'
                ],
                'circle-opacity': 0.75,
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['get', 'mag'],
                    6, 20,
                    8, 40
                ]
            }
        });

        map.addLayer({
            'id': 'earthquake-labels',
            'type': 'symbol',
            'source': 'illegalRentals',
            'layout': {
                'text-field': ['concat', ['to-string', ['get', 'mag']], 'm'],
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-size': 12
            },
            'paint': {
                'text-color': 'rgba(0,0,0,0.5)'
            }
        });

        // Set filter to first month of the year
        // 0 = January
        filterBy(0);

        document.getElementById('slider').addEventListener('input', function(e) {
            var month = parseInt(e.target.value, 10);
            filterBy(month);
        });
    });
});
