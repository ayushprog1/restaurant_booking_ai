# 🍽️ Vaiu AI Software Developer Intern Assignment: Restaurant Booking Voice Agent

This repository contains the solution for the Vaiu AI SDE Intern assignment: building a functional, voice-enabled AI agent for restaurant table bookings.

## 🌟 Project Overview

This agent is built on the **MERN stack** (MongoDB, Express, React, Node.js) and fulfills all core technical requirements, including a custom third-party API integration and full voice functionality.

### Core Features Implemented:

* [cite_start]**Voice Interaction (STT/TTS):** Implemented using the **Web Speech API** for zero-cost, browser-native Speech-to-Text (STT) and Text-to-Speech (TTS). [cite: 32, 33, 34, 37]
* [cite_start]**Custom Integration: Weather API:** The agent fetches real-time weather data via **OpenWeatherMap** (free tier) for the booking date and provides a verbal suggestion for indoor or outdoor seating. [cite: 19, 63, 67]
* [cite_start]**Backend API:** A RESTful API built with **Node.js/Express** handles all business logic. [cite: 39]
* [cite_start]**Database:** **MongoDB** is used to persist booking data following the required schema. [cite: 21, 48]
* [cite_start]**Zero-Cost NLP:** Natural Language Processing (NLP) is handled via a **rule-based parser (Regex)** in the backend to extract key entities (guests, time, cuisine) from the transcribed voice command, avoiding the need for paid services like OpenAI. [cite: 110, 113]

---

## 🛠️ Technical Requirements & Stack

| Component | Technology Used | Rationale / Fulfillment |
| :--- | :--- | :--- |
| **Voice Interface** | **React** (Frontend) | Simple web interface for interaction. |
| **STT/TTS** | **Web Speech API** | [cite_start]Free, browser-native solution fulfilling voice requirements. [cite: 37] |
| **Backend** | **Node.js + Express** | [cite_start]Standard RESTful API server. [cite: 39] |
| **Database** | **MongoDB (Mongoose)** | [cite_start]NoSQL database, required for schema persistence. [cite: 48] |
| **Weather Integration** | **Axios + OpenWeatherMap** | [cite_start]Critical custom integration for real-time data and seating suggestions. [cite: 65] |
| **NLP** | **Custom Rule-based Parser** | [cite_start]Zero-cost extraction of booking details (guests, date, time). [cite: 113] |

### [cite_start]Backend API Endpoints [cite: 40-47]

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/bookings` | Creates a new booking, runs the NLP parser, checks the weather, and saves data. |
| `GET` | `/api/bookings` | Retrieves all stored bookings. |
| `GET` | `/api/bookings/:id` | Retrieves a specific booking by its ID. |
| `DELETE` | `/api/bookings/:id` | Cancels (deletes) a specific booking. |

---

## 🚀 Setup and Run Instructions

This project requires Node.js (version 16+) and a MongoDB instance (Atlas free tier recommended).

### 1. Backend Setup (`/server` folder)

1.  Navigate into the `server` directory:
    ```bash
    cd server
    ```
2.  Install all required dependencies:
    ```bash
    npm install express mongoose cors dotenv axios uuid
    ```
3.  Create a file named **`.env`** in the `server` directory and populate it with your keys:
    ```env
    MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_NAME>.mongodb.net/?retryWrites=true&w=majority
    OPENWEATHER_API_KEY=<Your_Free_OpenWeatherMap_Key>
    PORT=5000
    ```
4.  Start the Express server:
    ```bash
    node index.js
    ```
    (Expected output: `✅ MongoDB Connected` and `🚀 Server running on http://localhost:5000`)

### 2. Frontend Setup (`/client` folder)

1.  Navigate into the `client` directory:
    ```bash
    cd ../client
    ```
2.  Install React dependencies:
    ```bash
    npm install axios
    ```
3.  Start the React development server:
    ```bash
    npm start
    ```
    (The app will open automatically in your browser, usually at `http://localhost:3000`)

---

## 🗣️ How to Test the Voice Agent

1.  Open the web app in a **Chrome** browser (Web Speech API works best here).
2.  Click the **"🎤 Start Voice Interaction"** button.
3.  Speak a command containing key booking details.
    * **Sample Command:** *"I want to book a table for 4 people at 7 PM for Italian food."*
4.  The agent will:
    * Transcribe your voice (STT).
    * Send the text to the backend.
    * The backend parser extracts: `guests: 4`, `time: 7 PM`, `cuisine: Italian`.
    * The server checks OpenWeatherMap for the current weather.
    * The server constructs a confirmation message that includes the weather suggestion.
    * [cite_start]The agent speaks the confirmation and suggestion back to you (TTS). [cite: 20]
    * [cite_start]The complete booking is stored in MongoDB. [cite: 21]

---

## ✅ Deliverables Checklist

* [cite_start][x] Working voice agent (can run locally). [cite: 130]
* [cite_start][x] Clean code with comments. [cite: 131]
* [cite_start][x] README with setup instructions. 
* [cite_start][ ] Screen recording (2-3 min) showing the full voice interaction and database storage. [cite: 133]
* [cite_start][x] GitHub Repository is public. [cite: 136]

---

**Thank you for the opportunity!**
