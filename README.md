# NER SmartLogix — AI-Based Smart Logistics and Accessibility Intelligence Platform for NER

### Smart India Hackathon 2026 | Problem Statement: SIH26002
**Theme:** Smart Automation  
**Team:** Innovexa  
**Target Region:** North Eastern Region (NER), India  

---

## 1. Project Overview & Problem Solved
The North Eastern Region (NER) of India faces unique transport challenges, including mountainous terrain, heavy monsoon rainfall, dense fog, flash floods, landslides, and poor road connectivity. 

Traditional navigation platforms select routes based strictly on the **shortest distance**. This platform solves this by evaluating a multi-factor **Accessibility and Safety Risk Profile** to recommend optimal detours and paths for logistics providers, emergency medical responses, and government administrators.

---

## 2. Platform Architecture
```
                   +----------------------------------+
                   |          React Frontend          |
                   |      Vite + Tailwind + Leaflet   |
                   +----------------+-----------------+
                                    |
                                    | Rest API (JWT Auth)
                                    v
                   +----------------+-----------------+
                   |         FastAPI Backend          |
                   |      Python 3.14 + Uvicorn       |
                   +-------+------------------+-------+
                           |                  |
           +---------------+-------+          +-------+---------------+
           | Local Logic Services  |                  | External APIs |
           +-----------------------+                  +---------------+
           | - Risk Score Engine   |                  | - OpenStreetMap
           | - Accessibility Engine|                  | - OSRM Routing
           | - Vehicle GPS Tracker |                  | - OpenWeather
           | - Alerts Broker       |                  | - Gemini AI
           +-----------------------+                  +---------------+
                                    |
                                    v
                   +----------------+-----------------+
                   |       PostgreSQL Database        |
                   |       (SQLite Demo Fallback)     |
                   +----------------------------------+
```

---

## 3. Technology Stack
* **Frontend:** React.js, Vite, Tailwind CSS, Leaflet, React Leaflet, Recharts, Axios, React Router.
* **Backend:** Python, FastAPI, Uvicorn, SQLAlchemy, Pydantic, Passlib (bcrypt), Python-jose (JWT).
* **Database:** PostgreSQL (with SQLite automatic fallback for demo mode).
* **AI Engine:** Google Gemini API (Google Generative AI SDK).
* **Weather Service:** OpenWeather API.
* **GIS Routing:** OpenStreetMap, OSRM.

---

## 4. Key Features
1. **Multi-Factor Route Evaluation:** Calculates safety risk (0-100) and accessibility (0-100) using terrain, weather forecasts, active flood logs, and historical data.
2. **AI Decision explanation:** Backend proxies Gemini requests securely to explain route recommendations in plain language.
3. **Live GIS Tracking:** Displays vehicles with simulated GPS updates, color-coded roadblocks, and weather warning layers.
4. **Emergency SOS Mode:** Emergency route selector that prioritizes safety detours and weight-limit bridge bypasses over speed.
5. **Offline Incident reporting:** Field officers can log landslide or flood reports offline. Reports queue in `localStorage` and sync automatically when connection returns.
6. **Mathematical configuration:** Administrators can configure factor weights dynamically to adjust calculations.

---

## 5. Configuration & Setup

### Environment Variables (`backend/.env`)
Create a file at `backend/.env` with the following parameters:
```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
OPENWEATHER_API_KEY=YOUR_OPENWEATHER_API_KEY_HERE
DATABASE_URL=YOUR_POSTGRESQL_DATABASE_URL_HERE
JWT_SECRET_KEY=YOUR_RANDOM_JWT_SECRET_HERE
```
*If variables are left blank, the system automatically runs in **DEMO MODE**, utilizing offline mock models, local SQLite, and simulated weather profiles without crashing.*

---

## 6. Installation & Launch Commands

### Backend Setup (FastAPI)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install required packages:
   ```bash
   pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
   ```
4. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup (Vite + React)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

---

## 7. Security Rules
* Gemini API keys and credentials are never stored, exposed, or requested by the React browser. All calls proxy through the secure FastAPI backend.
* Passwords are encrypted using salted bcrypt hashes.
* Role-based access control restricts critical alert broadcasting and incident verification to `ADMIN` and `LOGISTICS_OPERATOR` accounts.
