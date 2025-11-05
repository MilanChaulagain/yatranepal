import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: true,
        trim: true
    },
    description:
    {
        type: String,
        required: true,
        trim: true
    },
    category:
    {
        type: String,
        required: true,
        enum: ['Cultural', 'Natural', 'Historical', 'Adventure', 'Religious', 'Food Destinations','Photography'],
        trim: true,
    },
    city:
    {
        type: String,
        required: true,
        trim: true
    },
    address:
    {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    img:
    {
        type: String,
        required: true,
    },
    // Optional planning-related fields
    entranceFee: { type: Number, default: 0 },
    openingHours: { type: String, default: "09:00-18:00" },
    avgVisitMins: { type: Number, default: 90 },
    popularityScore: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
placeSchema.index({ city: 1 });
placeSchema.index({ category: 1 });
placeSchema.index({ name: 'text', description: 'text', city: 'text' });
placeSchema.index({ location: '2dsphere' });
placeSchema.index({ popularityScore: -1 });
placeSchema.index({ createdAt: -1 });

const Place = mongoose.models.Place || mongoose.model('Place', placeSchema);
export default Place;
