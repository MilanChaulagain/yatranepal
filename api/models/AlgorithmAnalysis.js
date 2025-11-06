import mongoose from 'mongoose';

const AlgorithmAnalysisSchema = new mongoose.Schema({
    userLocation: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    queryParams: {
        city: String,
        category: String,
        radius: Number,
        searchQuery: String
    },
    results: {
        totalPlaces: { type: Number, required: true },
        haversineAvgDistance: Number,
        vincentyAvgDistance: Number,
        avgDifference: Number,
        avgPercentageDiff: Number,
        haversineTime: Number, // in milliseconds
        vincentyTime: Number    // in milliseconds
    },
    places: [{
        placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
        placeName: String,
        haversineDistance: Number,
        vincentyDistance: Number,
        difference: Number,
        percentageDiff: Number
    }],
    conclusion: String,
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for querying
AlgorithmAnalysisSchema.index({ timestamp: -1 });
AlgorithmAnalysisSchema.index({ 'userLocation.latitude': 1, 'userLocation.longitude': 1 });

export default mongoose.model('AlgorithmAnalysis', AlgorithmAnalysisSchema);
