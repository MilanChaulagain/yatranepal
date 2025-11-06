import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { initializeDualConnections } from "./utils/dualDatabase.js";

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Routes
import authRoute from "./routes/auth.js";
import userRoute from "./routes/users.js";
import hotelRoute from "./routes/hotels.js";
import roomRoute from "./routes/rooms.js";
import exchangeRoute from "./routes/exchange.js";
import touristRoute from "./routes/touristguide.js";
import chatRoute from "./routes/chat.js";
import messageRoutes from "./routes/message.js";
import placeRoutes from "./routes/place.js";
import reviewRoute from "./routes/review.js";
import searchRoute from "./routes/search.js";
import blogRoute from "./routes/blog.js";
import calendarRoute from "./routes/calendar.js";
import chadParbaRoute from "./routes/chadParba.js";
import bookingRoute from "./routes/booking.js";
import imageSliderRoute from "./routes/imageSlider.js";
import reservationRoute from "./routes/reservations.js";
import paymentRoute from "./routes/payment.js";
import uploadRoute from "./routes/upload.js";
import tripRoute from "./routes/trips.js";
import storiesRoute from "./routes/stories.js";
import travellersChoiceRoute from "./routes/travellersChoice.js";

dotenv.config();


// Add this debug code
console.log("MONGO URI:", process.env.MONGO);
console.log("PORT:", process.env.PORT);
console.log("All env vars:", process.env);

const app = express();

// These middlewares are required to read req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Allowed frontend origins
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8080",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/hotels", hotelRoute);
app.use("/api/rooms", roomRoute);
app.use("/api/money-exchange", exchangeRoute);
app.use("/api/touristguide", touristRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoutes);
app.use("/api/place", placeRoutes);
app.use("/api/review", reviewRoute);
app.use("/api/search", searchRoute);
app.use("/api/blogs", blogRoute);
app.use("/api", calendarRoute);
app.use("/api/chadparba", chadParbaRoute);
app.use("/api", bookingRoute);
app.use("/api/imageSlider", imageSliderRoute);
app.use('/api/reservations', reservationRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/upload', uploadRoute);
app.use("/api/trips", tripRoute);
app.use('/api/stories', storiesRoute);
app.use('/api/travellers-choice', travellersChoiceRoute);
// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong!";
    // Log server-side for diagnostics
    console.error("[API Error]", {
        method: req.method,
        url: req.originalUrl,
        status: errorStatus,
        message: errorMessage,
        name: err?.name,
        code: err?.code,
        stack: process.env.NODE_ENV === "production" ? undefined : err?.stack,
    });
    res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        name: err?.name,
        code: err?.code,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
});

const PORT = process.env.PORT;

const startServer = async () => {
    try {
        // Initialize dual database connections
        await initializeDualConnections();
        
        // Sync indexes to drop outdated ones (e.g., text index on tags)
        try {
            const TravelStory = (await import('./models/TravelStory.js')).default;
            await TravelStory.syncIndexes();
            console.log('TravelStory indexes synced.');
        } catch (e) {
            console.warn('Index sync warning:', e.message);
        }
        
        app.listen(PORT, () => {
            console.log(`Backend running at http://localhost:${PORT}`);
            if (process.env.DUAL_WRITE === 'true') {
                console.log('🔄 DUAL WRITE MODE ENABLED - Writing to both Atlas and Localhost');
            }
        });
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

startServer();

const dbConnect =()=> {
    mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected!");
});
}

