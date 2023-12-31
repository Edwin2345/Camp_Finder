mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v12', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 9, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl())

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
       new mapboxgl.Popup({offset: 25})
       .setHTML(
        `<h6><b>${campground.title}</b></h6><h6>${campground.location}</h6>`
       )
    )
    .addTo(map)