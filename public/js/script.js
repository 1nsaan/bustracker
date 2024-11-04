const socket = io('http://192.168.43.78:3000');

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            const randomOffset = (Math.random() - 0.5) * 0.001; // Small offset for testing
            socket.emit("send-location", { latitude: latitude + randomOffset, longitude: longitude + randomOffset });
        },
        (error) => {
            console.error(`Geolocation error (${error.code}): ${error.message}`);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

const map = L.map("map").setView([0, 0], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

// Handle received location updates
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
   // console.log(`Client-Received location for ${id}: ${latitude}, ${longitude}`); // Debugging
    map.setView([latitude, longitude]);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
