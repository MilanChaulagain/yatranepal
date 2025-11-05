# yatranepal

🌏 YatraNepal – Discover Nepal Like Never Before

YatraNepal is a tourism platform built with the MERN stack that helps tourists explore Nepal’s beauty. From finding attractions, discovering hotels, checking reviews, and making reservations, YatraNepal makes travel planning simple, interactive, and enjoyable.

✨ Features

🏞️ Explore Tourist Attractions – Search and discover places with detailed descriptions, images, and visitor tips.

🏨 Hotel Listings & Reservations – Find accommodation and book reservations directly.

⭐ Reviews & Ratings – Share experiences and read feedback from other travelers.

🗺️ Google Maps Integration – View interactive maps, nearby attractions, and get live directions.

🔐 User Authentication – Secure login and signup with personalized features.

🛠️ Admin Dashboard – Manage places, hotels, and reservations efficiently.

📱 Responsive UI/UX – Optimized for desktop and mobile devices.

🛠️ Tech Stack

Frontend: React.js, Tailwind CSS, Lucide Icons
Backend: Node.js, Express.js
Database: MongoDB
Maps & Location: Google Maps API, Geolocation
Authentication: JWT-based authentication
Deployment: (e.g., Vercel/Netlify for frontend, Render/Heroku for backend)

📸 Screenshots

(Add screenshots of home page, place details, Google Maps integration, and admin dashboard here)

🚀 Getting Started
Prerequisites

Node.js (v16 or later)

MongoDB (local or Atlas)

Google Maps API Key

Installation

Clone the repository

git clone https://github.com/MilanChaulagain/yatranepalv2.git
cd yatranepal


Install dependencies

npm install
cd client && npm install


Set up environment variables
Create a .env file in the root and add:

PORT=8800
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REACT_APP_API_BASE_URL=http://localhost:8800
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key


Run the application

# Run backend
npm start  

# Run frontend
cd client
npm start


Open in browser → http://localhost:3000

📂 Project Structure
yatranepal/
│── backend/           # Express server & APIs
│── client/            # React frontend
│── models/            # Mongoose schemas
│── routes/            # API routes
│── controllers/       # Business logic
│── .env               # Environment variables
│── package.json

📌 Roadmap

 Add hotel booking & payment gateway integration

 Add itinerary planner for tourists

 Add multi-language support

 Add offline map support

🤝 Contributing

Contributions are welcome! 🚀

Fork the repo

Create your feature branch (git checkout -b feature/new-feature)

Commit changes (git commit -m 'Add new feature')

Push branch (git push origin feature/new-feature)

Open a Pull Request

📜 License

This project is licensed under the MIT License.

👥 Team

👨‍💻 Developer: Milan Chaulagain

🌏 Project: YatraNepal
