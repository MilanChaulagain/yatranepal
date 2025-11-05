import Place from "../models/Place.js";
// Utility: Calculate distance (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// Create a new place
export const createPlace = async (req, res) => {
    try {
        const place = new Place(req.body);
        await place.save();
        res.status(201).json({
            success: true,
            data: place
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get all places with advanced filtering
export const getAllPlaces = async (req, res) => {
    try {
        const { 
            search,
            city,
            category,
            lat,
            lng,
            radius,
            limit = 50,
            page = 1,
            sort = '-popularityScore'
        } = req.query;

        const query = {};
        
        // Search using text index for better performance
        if (search) {
            query.$text = { $search: search };
        }

        // Filter by city
        if (city && city !== 'all') {
            query.city = new RegExp(`^${city}$`, 'i');
        }

        // Filter by category
        if (category && category !== 'all') {
            query.category = category;
        }

        // For location-based queries, use geospatial query
        if (lat && lng && radius) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
                }
            };
        }

        const skip = (page - 1) * limit;
        
        // For geospatial queries, we can't use countDocuments with $near
        // So we'll get the total differently
        let total;
        if (lat && lng && radius) {
            // For geospatial queries, get total without pagination first
            const allNearbyPlaces = await Place.find(query)
                .select('_id')
                .lean()
                .exec();
            total = allNearbyPlaces.length;
        } else {
            total = await Place.countDocuments(query);
        }
        
        // Select only necessary fields for list view - reduces data transfer
        let placesQuery = Place.find(query)
            .select('name description category city location img entranceFee popularityScore avgVisitMins')
            .limit(+limit)
            .skip(skip)
            .lean();
        
        // Only add sort if not using geospatial query (can't sort with $near)
        if (!(lat && lng && radius)) {
            placesQuery = placesQuery.sort(search ? { score: { $meta: 'textScore' } } : sort);
        }
        
        const places = await placesQuery.exec();

        res.status(200).json({
            success: true,
            count: places.length,
            total,
            page: +page,
            pages: Math.ceil(total / limit),
            data: places,
        });
    } catch (error) {
        console.error('Get places error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get a single place by ID
export const getPlaceById = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) {
            return res.status(404).json({ 
                success: false,
                error: 'Place not found' 
            });
        }
        res.status(200).json({
            success: true,
            data: place
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Update a place
export const updatePlace = async (req, res) => {
    try {
        const place = await Place.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );
        if (!place) {
            return res.status(404).json({ 
                success: false,
                error: 'Place not found' 
            });
        }
        res.status(200).json({
            success: true,
            data: place
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Delete a place
export const deletePlace = async (req, res) => {
    try {
        const place = await Place.findByIdAndDelete(req.params.id);
        if (!place) {
            return res.status(404).json({ 
                success: false,
                error: 'Place not found' 
            });
        }
        res.status(200).json({ 
            success: true,
            message: 'Place deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get places by category
export const getPlacesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['Cultural', 'Natural', 'Historical', 'Adventure', 'Religious', 'Food Destinations', 'Photography'];
        
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const places = await Place.find({ category });
        res.status(200).json({
            success: true,
            count: places.length,
            data: places
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = [
            'Cultural', 'Natural', 'Historical', 
            'Adventure', 'Religious', 
            'Food Destinations', 'Photography'
        ];
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all available cities
export const getAllCities = async (req, res) => {
    try {
        const cities = await Place.distinct('city');
        // Filter out null/undefined values and sort alphabetically
        const validCities = cities
            .filter(city => city && city.trim() !== '')
            .sort();
        
        res.status(200).json({
            success: true,
            data: validCities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};