import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAXFd5xYiJ8ae57YHEHHcBnxuNav76A22s",
  authDomain: "projectmap-61d82.firebaseapp.com",
  databaseURL: "https://projectmap-61d82-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "projectmap-61d82",
  storageBucket: "projectmap-61d82.appspot.com",
  messagingSenderId: "213904513487",
  appId: "1:213904513487:web:a427e68e9058c28d955aba",
  measurementId: "G-74NQTY9TM3",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Initialize map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors',
}).addTo(map);

const userLocation = { lat: 12.9716, lng: 77.5946 }; // Simulated user location
const contacts = [];

// Add user marker
L.marker(userLocation).addTo(map).bindPopup('User Location').openPopup();
map.setView(userLocation, 13);

// Add contact
document.getElementById('addContactButton').addEventListener('click', () => {
  const emailInput = document.getElementById('contact-email');
  const email = emailInput.value;

  if (email) {
    contacts.push(email);
    const listItem = document.createElement('li');
    listItem.textContent = email;
    document.getElementById('contactList').appendChild(listItem);
    emailInput.value = '';
  } else {
    alert('Please enter a valid email.');
  }
});

// Generate alert link to contact.html
function generateLiveLocationLink(userId) {
  return `contact.html?user=${userId}`;
}

// Function to send email via EmailJS
function sendEmailWithEmailJS(to, subject, body) {
  // Initialize EmailJS with the public key
  emailjs.init('BVg2UahwRuJ5Asuim'); // Replace with your actual public key from EmailJS dashboard

  const templateParams = {
    to_email: to,         // Match parameter name with EmailJS template configuration
    subject: subject,
    message: body,
    from_name: 'Emergency Alert System', // Customize as needed
  };

  // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your EmailJS service/template IDs
  emailjs.send('service_r9iiqhi', 'template_so98h63', templateParams)
    .then((response) => {
      console.log('Email sent successfully!', response.status, response.text);
      alert(`Alert sent to ${to}`);
    })
    .catch((error) => {
      console.error('Error sending email:', error);
      alert(`Failed to send alert to ${to}.`);
    });
}

// Send alerts
document.getElementById('sendAlertButton').addEventListener('click', () => {
  if (!contacts.length) {
    alert('No contacts to send alerts to.');
    return;
  }

  const userId = 'uniqueUserId'; // Replace with actual unique ID
  const locationRef = ref(db, `locations/${userId}/user`);

  // Save the user's location in Firebase
  set(locationRef, userLocation)
    .then(() => {
      console.log('User location saved.');

      const link = generateLiveLocationLink(userId);

      // Send alert email to each contact
      contacts.forEach((contact) => {
        const emailBody = `
          Emergency Alert!
          View live location: ${link}
        `;
        sendEmailWithEmailJS(contact, 'Emergency Alert', emailBody);
      });
    })
    .catch((error) => {
      console.error('Error saving location:', error);
    });
});
