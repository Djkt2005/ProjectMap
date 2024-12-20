import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAXFd5xYiJ8ae57YHEHHcBnxuNav76A22s",
  authDomain: "projectmap-61d82.firebaseapp.com",
  databaseURL: "https://projectmap-61d82-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "projectmap-61d82",
  storageBucket: "projectmap-61d82.appspot.com",
  messagingSenderId: "213904513487",
  appId: "1:213904513487:web:a427e68e9058c28d955aba",
  measurementId: "G-74NQTY9TM3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Initialize map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

const userMarker = L.marker([0, 0]).addTo(map).bindPopup('User Location');
const contactMarker = L.marker([0, 0]).addTo(map).bindPopup('Your Location');
let routePolyline = null;

// Extract user ID from URL
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user');

// Fetch user location from Firebase
const userRef = ref(db, `locations/${userId}/user`);
onValue(userRef, (snapshot) => {
  const userLocation = snapshot.val();
  if (userLocation) {
    userMarker.setLatLng([userLocation.lat, userLocation.lng]).openPopup();
    document.getElementById('userLocation').textContent = `${userLocation.lat}, ${userLocation.lng}`;

    if (routePolyline) map.removeLayer(routePolyline);
    routePolyline = L.polyline([userLocation, contactMarker.getLatLng()], { color: 'blue' }).addTo(map);
    map.fitBounds(routePolyline.getBounds());
  }
});

// Update contact location in Firebase
if (navigator.geolocation) {
  navigator.geolocation.watchPosition((position) => {
    const contactLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    set(ref(db, `locations/${userId}/contact`), contactLocation);
    contactMarker.setLatLng([contactLocation.lat, contactLocation.lng]).openPopup();
    document.getElementById('contactLocation').textContent = `${contactLocation.lat}, ${contactLocation.lng}`;
  });
}
