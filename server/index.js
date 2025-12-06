require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

// --- Configuration ---
const PORT = process.env.PORT || 5000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// --- Mongoose Schema [cite: 49-62] ---
const bookingSchema = new mongoose.Schema({
  bookingId: String,
  customerName: String, // [cite: 52]
  numberOfGuests: Number, // [cite: 53]
  bookingDate: Date, // [cite: 54]
  bookingTime: String, // [cite: 55]
  cuisinePreference: String, // [cite: 56]
  specialRequests: String, // [cite: 57]
  weatherInfo: Object, // [cite: 59]
  seatingPreference: String, // indoor/outdoor [cite: 60]
  status: { type: String, default: 'confirmed' }, // confirmed, pending, cancelled [cite: 61]
  createdAt: { type: Date, default: Date.now } // [cite: 62]
});

const Booking = mongoose.model('Booking', bookingSchema);

// --- Helper: Rule-Based Input Parser (Zero-Cost NLP) ---
// This function extracts key data from the user's raw text using regex (simplified)
function parseUserInput(text) {
  const result = {};
  const lowerText = text.toLowerCase();

  // 1. Guests: Look for "for X people" or "table for X" [cite: 14]
  const guestMatch = lowerText.match(/for\s*(\d+)\s*people|table\s*for\s*(\d+)|(\d+)\s*guest/);
  result.numberOfGuests = guestMatch ? parseInt(guestMatch[1] || guestMatch[2] || guestMatch[3]) : 2; 

  // 2. Time: Look for "at X o'clock" or "at X PM/AM" [cite: 16]
  const timeMatch = lowerText.match(/at\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/);
  result.bookingTime = timeMatch ? timeMatch[1].toUpperCase() : "7:00 PM";
  
  // 3. Cuisine: Look for common cuisine keywords [cite: 17]
  if (lowerText.includes('italian')) result.cuisinePreference = 'Italian';
  else if (lowerText.includes('chinese')) result.cuisinePreference = 'Chinese';
  else if (lowerText.includes('indian')) result.cuisinePreference = 'Indian';
  else result.cuisinePreference = 'Any';

  // For simplicity and guaranteed weather data, we assume "today"
  result.bookingDate = new Date(); 
  result.customerName = "Voice Guest";
  result.specialRequests = lowerText.includes('birthday') ? 'Birthday celebration' : 'None'; // [cite: 18]

  return result;
}

// --- Helper: Weather Integration [cite: 63-70] ---
async function getWeather(date, location = "New York") {
  try {
    // We use the free current weather endpoint for simplicity, as forecast requires subscription or careful parsing
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric`);
    
    const weatherData = response.data;
    const condition = weatherData.weather[0].main.toLowerCase();
    
    let suggestion = "";

    // Generate verbal seating suggestion based on weather [cite: 67]
    if (condition.includes('rain') || condition.includes('thunderstorm') || weatherData.main.temp < 10) {
      suggestion = `It looks cold and rainy today. I'd recommend our cozy indoor area.`; // [cite: 70]
      seating = 'indoor';
    } else {
      suggestion = `The weather looks great on ${date.toDateString()}! Would you prefer outdoor seating?`; // [cite: 68]
      seating = 'outdoor';
    }

    return { data: weatherData, suggestion, seating };

  } catch (error) {
    console.error("Weather API Error:", error.message);
    const dateString = date.toDateString();
    // Fail-safe response if API call fails
    return { 
        data: { error: "API Failed" }, 
        suggestion: `I couldn't check the weather for ${dateString}, but we have both indoor and outdoor seating.`, 
        seating: "unspecified" 
    };
  }
}

// --- API Endpoints [cite: 40-47] ---

// 1. POST /api/bookings (Create a new booking) [cite: 41, 43]
app.post('/api/bookings', async (req, res) => {
  try {
    // Raw user voice transcript comes from the frontend
    const { userText } = req.body; 
    
    // 1. Extract details using the zero-cost parser
    const parsedData = parseUserInput(userText);
    
    // 2. Fetch weather using the free API [cite: 65]
    const { data: weatherInfo, suggestion: weatherMessage, seating: seatingPreference } = await getWeather(parsedData.bookingDate);
    
    // 3. Store booking in database [cite: 21]
    const newBooking = new Booking({
      bookingId: uuidv4(),
      ...parsedData, // contains name, guests, date, time, cuisine
      weatherInfo,
      seatingPreference,
      status: 'confirmed'
    });

    await newBooking.save();

    const responseText = `Booking confirmed! Table for ${newBooking.numberOfGuests} at ${newBooking.bookingTime} on ${newBooking.bookingDate.toDateString()}. ${weatherMessage}`;
    
    res.status(201).json({ 
      message: responseText, 
      booking: newBooking
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create booking." });
  }
});

// 2. GET /api/bookings (Get all bookings) [cite: 42, 44]
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /api/bookings/:id (Get specific booking) [cite: 45]
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. DELETE /api/bookings/:id (Cancel booking) [cite: 46, 47]
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    const result = await Booking.deleteOne({ bookingId: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking cancelled successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));