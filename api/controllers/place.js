import Place from "../models/Place.js";
import AlgorithmAnalysis from "../models/AlgorithmAnalysis.js";

// ==================== DISTANCE CALCULATION ALGORITHMS ====================

/**
 * Haversine Formula - Calculates great-circle distance between two points
 * Assumes Earth is a perfect sphere
 * @param {number} lat1 - Latitude of point 1 in degrees
 * @param {number} lon1 - Longitude of point 1 in degrees
 * @param {number} lat2 - Latitude of point 2 in degrees
 * @param {number} lon2 - Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers
 */
const calculateDistanceHaversine = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371; // Mean radius of Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Vincenty's Formula - More accurate calculation considering Earth's ellipsoidal shape
 * Uses iterative method with WGS-84 ellipsoid parameters
 * @param {number} lat1 - Latitude of point 1 in degrees
 * @param {number} lon1 - Longitude of point 1 in degrees
 * @param {number} lat2 - Latitude of point 2 in degrees
 * @param {number} lon2 - Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers
 */
const calculateDistanceVincenty = (lat1, lon1, lat2, lon2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    
    // WGS-84 ellipsoid parameters
    const a = 6378137.0; // Semi-major axis (equatorial radius) in meters
    const b = 6356752.314245; // Semi-minor axis (polar radius) in meters
    const f = 1 / 298.257223563; // Flattening
    
    const L = toRad(lon2 - lon1);
    const U1 = Math.atan((1 - f) * Math.tan(toRad(lat1)));
    const U2 = Math.atan((1 - f) * Math.tan(toRad(lat2)));
    const sinU1 = Math.sin(U1);
    const cosU1 = Math.cos(U1);
    const sinU2 = Math.sin(U2);
    const cosU2 = Math.cos(U2);
    
    let lambda = L;
    let lambdaP;
    let iterLimit = 100;
    let cosSqAlpha, sinSigma, cos2SigmaM, cosSigma, sigma;
    
    do {
        const sinLambda = Math.sin(lambda);
        const cosLambda = Math.cos(lambda);
        sinSigma = Math.sqrt(
            (cosU2 * sinLambda) ** 2 +
            (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) ** 2
        );
        
        if (sinSigma === 0) return 0; // Co-incident points
        
        cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
        sigma = Math.atan2(sinSigma, cosSigma);
        const sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma;
        cosSqAlpha = 1 - sinAlpha ** 2;
        cos2SigmaM = cosSigma - (2 * sinU1 * sinU2) / cosSqAlpha;
        
        if (isNaN(cos2SigmaM)) cos2SigmaM = 0; // Equatorial line
        
        const C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
        lambdaP = lambda;
        lambda = L + (1 - C) * f * sinAlpha * (
            sigma + C * sinSigma * (
                cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM ** 2)
            )
        );
    } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);
    
    if (iterLimit === 0) {
        // Formula failed to converge, fallback to Haversine
        return calculateDistanceHaversine(lat1, lon1, lat2, lon2);
    }
    
    const uSq = cosSqAlpha * ((a ** 2 - b ** 2) / (b ** 2));
    const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    const deltaSigma = B * sinSigma * (
        cos2SigmaM + (B / 4) * (
            cosSigma * (-1 + 2 * cos2SigmaM ** 2) -
            (B / 6) * cos2SigmaM * (-3 + 4 * sinSigma ** 2) * (-3 + 4 * cos2SigmaM ** 2)
        )
    );
    
    const s = b * A * (sigma - deltaSigma);
    
    return s / 1000; // Convert meters to kilometers
};

// Default distance calculation (using Haversine for compatibility)
const calculateDistance = calculateDistanceHaversine;

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
            sort = '-popularityScore',
            includeAlgorithmAnalysis = false // New parameter for analysis
        } = req.query;

        const query = {};
        const userLat = lat ? parseFloat(lat) : null;
        const userLng = lng ? parseFloat(lng) : null;
        
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

        // Add algorithm analysis if requested and location is provided
        let algorithmAnalysis = null;
        if (includeAlgorithmAnalysis === 'true' && userLat && userLng && places.length > 0) {
            const startTimeHaversine = performance.now();
            const haversineDistances = places.map(place => {
                const [placeLng, placeLat] = place.location.coordinates;
                return calculateDistanceHaversine(userLat, userLng, placeLat, placeLng);
            });
            const endTimeHaversine = performance.now();

            const startTimeVincenty = performance.now();
            const vincentyDistances = places.map(place => {
                const [placeLng, placeLat] = place.location.coordinates;
                return calculateDistanceVincenty(userLat, userLng, placeLat, placeLng);
            });
            const endTimeVincenty = performance.now();

            // Simplified analysis - just compare distances and calculate errors
            const analysisPlaces = places.map((place, idx) => {
                const haversineDist = haversineDistances[idx];
                const vincentyDist = vincentyDistances[idx];
                const diff = Math.abs(haversineDist - vincentyDist);
                const percentDiff = (diff / vincentyDist * 100);
                
                return {
                    placeId: place._id,
                    placeName: place.name,
                    haversineDistance: parseFloat(haversineDist.toFixed(3)),
                    vincentyDistance: parseFloat(vincentyDist.toFixed(3)),
                    difference: parseFloat(diff.toFixed(3)),
                    percentageDiff: parseFloat(percentDiff.toFixed(4))
                };
            });

            // Calculate averages
            const avgHaversine = haversineDistances.reduce((a, b) => a + b, 0) / haversineDistances.length;
            const avgVincenty = vincentyDistances.reduce((a, b) => a + b, 0) / vincentyDistances.length;
            const avgDiff = analysisPlaces.reduce((a, b) => a + b.difference, 0) / analysisPlaces.length;
            const avgPercentDiff = analysisPlaces.reduce((a, b) => a + b.percentageDiff, 0) / analysisPlaces.length;
            
            const haversineTime = parseFloat((endTimeHaversine - startTimeHaversine).toFixed(3));
            const vincentyTime = parseFloat((endTimeVincenty - startTimeVincenty).toFixed(3));

            // Simple conclusion
            let conclusion = '';
            if (avgPercentDiff < 0.1) {
                conclusion = 'Both algorithms give almost identical results. Haversine is recommended for better performance.';
            } else if (avgPercentDiff < 0.5) {
                conclusion = 'Minor differences detected. Haversine is sufficient for this use case.';
            } else {
                conclusion = 'Significant differences detected. Vincenty is recommended for higher accuracy.';
            }

            algorithmAnalysis = {
                totalPlaces: places.length,
                haversineAvgDistance: parseFloat(avgHaversine.toFixed(3)),
                vincentyAvgDistance: parseFloat(avgVincenty.toFixed(3)),
                avgDifference: parseFloat(avgDiff.toFixed(3)),
                avgPercentageDiff: parseFloat(avgPercentDiff.toFixed(4)),
                haversineTime,
                vincentyTime,
                conclusion,
                places: analysisPlaces
            };

            // Save to database
            try {
                const analysisDoc = new AlgorithmAnalysis({
                    userLocation: {
                        latitude: userLat,
                        longitude: userLng
                    },
                    queryParams: {
                        city: city || 'all',
                        category: category || 'all',
                        radius: radius ? parseFloat(radius) : null,
                        searchQuery: search || null
                    },
                    results: {
                        totalPlaces: places.length,
                        haversineAvgDistance: parseFloat(avgHaversine.toFixed(3)),
                        vincentyAvgDistance: parseFloat(avgVincenty.toFixed(3)),
                        avgDifference: parseFloat(avgDiff.toFixed(3)),
                        avgPercentageDiff: parseFloat(avgPercentDiff.toFixed(4)),
                        haversineTime,
                        vincentyTime
                    },
                    places: analysisPlaces,
                    conclusion
                });
                await analysisDoc.save();
                algorithmAnalysis.analysisId = analysisDoc._id;
            } catch (saveError) {
                console.error('Error saving analysis:', saveError);
            }
        }

        // If algorithm analysis is requested, return only analysis data
        if (includeAlgorithmAnalysis && algorithmAnalysis) {
            return res.status(200).json({
                success: true,
                algorithmAnalysis: {
                    ...algorithmAnalysis,
                    totalPlaces: places.length,
                    placeNames: places.map(p => p.name)
                }
            });
        }

        // Normal response with places data
        res.status(200).json({
            success: true,
            count: places.length,
            total,
            page: +page,
            pages: Math.ceil(total / limit),
            data: places
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

/**
 * Compare Haversine vs Vincenty algorithm performance and accuracy
 * Endpoint: GET /api/places/algorithm-comparison
 * Query params: lat, lng, radius (optional)
 */
export const compareAlgorithms = async (req, res) => {
    try {
        const { lat, lng, limit = 10 } = req.query;
        
        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                error: 'Latitude and longitude are required'
            });
        }

        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        // Get all places for comparison
        const places = await Place.find()
            .select('name city location')
            .limit(parseInt(limit))
            .lean();

        if (places.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No places found for comparison'
            });
        }

        const startTimeHaversine = performance.now();
        const haversineResults = places.map(place => {
            const [placeLng, placeLat] = place.location.coordinates;
            const distance = calculateDistanceHaversine(userLat, userLng, placeLat, placeLng);
            return {
                placeId: place._id,
                placeName: place.name,
                city: place.city,
                distance: distance
            };
        }).sort((a, b) => a.distance - b.distance);
        const endTimeHaversine = performance.now();
        const haversineTime = endTimeHaversine - startTimeHaversine;

        const startTimeVincenty = performance.now();
        const vincentyResults = places.map(place => {
            const [placeLng, placeLat] = place.location.coordinates;
            const distance = calculateDistanceVincenty(userLat, userLng, placeLat, placeLng);
            return {
                placeId: place._id,
                placeName: place.name,
                city: place.city,
                distance: distance
            };
        }).sort((a, b) => a.distance - b.distance);
        const endTimeVincenty = performance.now();
        const vincentyTime = endTimeVincenty - startTimeVincenty;

        // Calculate statistics
        const differences = haversineResults.map((h, idx) => {
            const v = vincentyResults[idx];
            return {
                place: h.placeName,
                haversineDistance: h.distance.toFixed(3),
                vincentyDistance: v.distance.toFixed(3),
                absoluteDifference: Math.abs(h.distance - v.distance).toFixed(3),
                percentageDifference: (Math.abs(h.distance - v.distance) / v.distance * 100).toFixed(4)
            };
        });

        const avgAbsDifference = differences.reduce((sum, d) => 
            sum + parseFloat(d.absoluteDifference), 0) / differences.length;
        
        const avgPercentageDifference = differences.reduce((sum, d) => 
            sum + parseFloat(d.percentageDifference), 0) / differences.length;
        
        const maxDifference = Math.max(...differences.map(d => parseFloat(d.absoluteDifference)));
        const minDifference = Math.min(...differences.map(d => parseFloat(d.absoluteDifference)));

        res.status(200).json({
            success: true,
            userLocation: {
                latitude: userLat,
                longitude: userLng
            },
            performance: {
                haversineTime: `${haversineTime.toFixed(3)} ms`,
                vincentyTime: `${vincentyTime.toFixed(3)} ms`,
                speedDifference: `${((vincentyTime - haversineTime) / haversineTime * 100).toFixed(2)}%`,
                fasterAlgorithm: haversineTime < vincentyTime ? 'Haversine' : 'Vincenty'
            },
            accuracy: {
                averageAbsoluteDifference: `${avgAbsDifference.toFixed(3)} km`,
                averagePercentageDifference: `${avgPercentageDifference.toFixed(4)}%`,
                maxDifference: `${maxDifference.toFixed(3)} km`,
                minDifference: `${minDifference.toFixed(3)} km`
            },
            detailedComparison: differences,
            analysis: {
                summary: `Haversine is ${haversineTime < vincentyTime ? 'faster' : 'slower'} by ${Math.abs(((vincentyTime - haversineTime) / haversineTime * 100)).toFixed(2)}%`,
                accuracyNote: `Average difference: ${avgAbsDifference.toFixed(3)} km (${avgPercentageDifference.toFixed(4)}%)`,
                recommendation: avgPercentageDifference < 0.5 
                    ? 'For most applications, Haversine is sufficient due to minimal accuracy difference and better performance.'
                    : 'Consider Vincenty for high-precision applications where accuracy is critical.',
                useCases: {
                    haversine: [
                        'Quick distance estimations',
                        'Real-time location services',
                        'Mobile applications with limited processing power',
                        'Short to medium distances (< 1000 km)'
                    ],
                    vincenty: [
                        'Precise geodetic calculations',
                        'Aviation and maritime navigation',
                        'Long-distance calculations',
                        'Scientific and research applications'
                    ]
                }
            }
        });
    } catch (error) {
        console.error('Algorithm comparison error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get all algorithm analysis records
export const getAllAnalysis = async (req, res) => {
    try {
        const { limit = 20, page = 1, sortBy = '-timestamp' } = req.query;
        
        const skip = (page - 1) * limit;
        
        const analyses = await AlgorithmAnalysis.find()
            .sort(sortBy)
            .limit(+limit)
            .skip(skip)
            .lean();

        const total = await AlgorithmAnalysis.countDocuments();

        res.status(200).json({
            success: true,
            count: analyses.length,
            total,
            page: +page,
            pages: Math.ceil(total / limit),
            data: analyses
        });
    } catch (error) {
        console.error('Get analysis error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get single analysis by ID
export const getAnalysisById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const analysis = await AlgorithmAnalysis.findById(id)
            .populate('places.placeId', 'name city category')
            .lean();

        if (!analysis) {
            return res.status(404).json({
                success: false,
                error: 'Analysis not found'
            });
        }

        res.status(200).json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Get analysis by ID error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

// Get analysis statistics
export const getAnalysisStats = async (req, res) => {
    try {
        const stats = await AlgorithmAnalysis.aggregate([
            {
                $group: {
                    _id: null,
                    totalAnalyses: { $sum: 1 },
                    avgHaversineTime: { $avg: '$results.haversineTime' },
                    avgVincentyTime: { $avg: '$results.vincentyTime' },
                    avgDifference: { $avg: '$results.avgDifference' },
                    avgPercentageDiff: { $avg: '$results.avgPercentageDiff' },
                    totalPlacesAnalyzed: { $sum: '$results.totalPlaces' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || {}
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};