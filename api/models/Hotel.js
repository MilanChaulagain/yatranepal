import mongoose from "mongoose";

const HotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    distance: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: undefined
        }
    },
    photos: { type: [String] },
    title: { type: String, required: true },
    desc: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5 },
    rooms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
        }
    ], 
    cheapestPrice: { type: Number, required: true },
    featured: { type: Boolean, default: false },
}, { timestamps: true });

const Hotel = mongoose.models.Hotel || mongoose.model("Hotel", HotelSchema);
export default Hotel;
