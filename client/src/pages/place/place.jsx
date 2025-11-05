import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import {
  Landmark, Palette, Castle, MapPin, Star, Info,
  Navigation, Heart, Mountain, TreePine, Camera,
  Utensils, Filter, X, Search
} from "lucide-react";
import { MdTempleHindu } from 'react-icons/md';
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import "./place.css";

// City data - Dynamic cities will be fetched from database
const cityData = {
  kathmandu: {
    name: "Kathmandu",
    icon: <Landmark size={20} />,
    color: "#c41e3a",
    description: "The vibrant capital city with ancient temples and bustling markets",
  },
  lalitpur: {
    name: "Lalitpur (Patan)",
    icon: <Palette size={20} />,
    color: "#1e40af",
    description: "City of arts and crafts with exquisite wood and stone carvings",
  },
  bhaktapur: {
    name: "Bhaktapur",
    icon: <Castle size={20} />,
    color: "#059669",
    description: "Preserved medieval city known for pottery and traditional architecture",
  },
  pokhara: {
    name: "Pokhara",
    icon: <Mountain size={20} />,
    color: "#0891b2",
    description: "Lakeside city with stunning mountain views and adventure activities",
  },
  janakpur: {
    name: "Janakpur",
    icon: <MdTempleHindu size={20} />,
    color: "#dc2626",
    description: "Ancient city known for its religious significance and cultural heritage",
  },
  chitwan: {
    name: "Chitwan",
    icon: <TreePine size={20} />,
    color: "#059669",
    description: "Gateway to Chitwan National Park with wildlife and nature experiences",
  },
  lumbini: {
    name: "Lumbini",
    icon: <MdTempleHindu size={20} />,
    color: "#7c3aed",
    description: "Birthplace of Lord Buddha and UNESCO World Heritage Site",
  },
  nagarkot: {
    name: "Nagarkot",
    icon: <Mountain size={20} />,
    color: "#0891b2",
    description: "Mountain resort town with panoramic Himalayan views",
  },
  bandipur: {
    name: "Bandipur",
    icon: <Castle size={20} />,
    color: "#dc2626",
    description: "Well-preserved hilltop town with traditional Newari architecture",
  },
  gorkha: {
    name: "Gorkha",
    icon: <Landmark size={20} />,
    color: "#c41e3a",
    description: "Historic town with Gorkha Durbar and birthplace of Prithvi Narayan Shah",
  },
  mustang: {
    name: "Mustang",
    icon: <Mountain size={20} />,
    color: "#0891b2",
    description: "Remote Himalayan region with ancient Tibetan culture and stunning landscapes",
  },
  everest: {
    name: "Everest Region",
    icon: <Mountain size={20} />,
    color: "#dc2626",
    description: "Home to Mount Everest and world-famous trekking routes",
  },
};

// Categories
const categories = [
  { id: "all", name: "All Categories", icon: <Filter size={16} /> },
  { id: "Cultural", name: "Cultural", icon: <Landmark size={16} /> },
  { id: "Natural", name: "Natural", icon: <TreePine size={16} /> },
  { id: "Historical", name: "Historical", icon: <Castle size={16} /> },
  { id: "Adventure", name: "Adventure", icon: <Mountain size={16} /> },
  { id: "Religious", name: "Religious", icon: <MdTempleHindu size={16} /> },
  { id: "Food Destinations", name: "Food", icon: <Utensils size={16} /> },
  { id: "Photography", name: "Photography", icon: <Camera size={16} /> },
];

// Helper functions
const getCityHighlights = (city) => {
  const highlights = {
    kathmandu: ["Swayambhunath", "Pashupatinath", "Boudhanath", "Durbar Square"],
    lalitpur: ["Patan Durbar", "Golden Temple", "Patan Museum", "Jawalakhel"],
    bhaktapur: ["Bhaktapur Durbar", "Nyatapola", "Pottery Square", "Taumadhi"]
  };
  return highlights[city] || [];
};

const getCityDescription = (city) => {
  const descriptions = {
    kathmandu: "Kathmandu, the capital of Nepal, is a bustling metropolis that blends ancient traditions with modern life. Home to sacred Hindu and Buddhist sites, vibrant markets, and historic palaces.",
    lalitpur: "Patan, officially known as Lalitpur (City of Arts), is renowned for its exceptional craftsmanship. The city's Durbar Square is a masterpiece of Newari architecture with bronze and stone craftsmanship.",
    bhaktapur: "Bhaktapur transports visitors back to medieval Nepal with its well-preserved architecture and traditional way of life. Known as the 'City of Devotees', it offers a quieter, more authentic experience."
  };
  return descriptions[city] || "";
};

const getCityTips = (city) => {
  const tips = {
    kathmandu: ["Visit Swayambhunath early morning", "Try Newari cuisine at local restaurants", "Attend evening aarti ceremony"],
    lalitpur: ["Take a guided tour to appreciate details", "Visit Patan Museum for art exhibits", "Try traditional sweets at local bakeries"],
    bhaktapur: ["Try the famous Bhaktapur yogurt", "Visit pottery square in the morning", "Explore the 55 Window Palace"]
  };
  return tips[city] || [];
};

const heritageSites = [
  { name: "Kathmandu Durbar Square", city: "Kathmandu", significance: "Historic royal palace complex", feature: "Kumari Ghar" },
  { name: "Swayambhunath Stupa", city: "Kathmandu", significance: "Ancient Buddhist pilgrimage site", feature: "All-seeing Buddha eyes" },
  { name: "Pashupatinath Temple", city: "Kathmandu", significance: "Sacred Hindu temple complex", feature: "Riverside cremation ghats" },
  { name: "Boudhanath Stupa", city: "Kathmandu", significance: "One of the largest stupas", feature: "Tibetan Buddhist center" },
  { name: "Patan Durbar Square", city: "Lalitpur", significance: "Royal palace of Malla kings", feature: "Patan Museum" },
  { name: "Bhaktapur Durbar Square", city: "Bhaktapur", significance: "Medieval city", feature: "55 Window Palace" },
  { name: "Changu Narayan Temple", city: "Bhaktapur", significance: "Oldest Hindu temple", feature: "Ancient inscriptions" },
];

const localExperiences = [
  { title: "Traditional Newari Feast", description: "Experience authentic cuisine with dishes like bara and chatamari", location: "Local homes" },
  { title: "Pottery Making Workshop", description: "Learn traditional techniques from master craftsmen", location: "Pottery Square" },
  { title: "Thangka Painting Class", description: "Create your own Buddhist thangka painting", location: "Boudhanath area" },
  { title: "Morning Monk Rituals", description: "Observe morning prayers at a monastery", location: "Kopan Monastery" },
  { title: "Heritage Walk", description: "Explore hidden courtyards and traditional architecture", location: "Patan backstreets" },
  { title: "Music Performance", description: "Enjoy classical Newari music", location: "Cultural centers" },
];

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8800";

//Haversine Algorithm
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => deg * (Math.PI / 180);

// Star Rating Component
const StarRating = ({ rating, size = 16 }) => {
  if (rating === null || rating === undefined) return null;
  
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={size}
          fill={index < Math.floor(rating) ? "currentColor" : "none"}
          color={index < Math.floor(rating) ? "#FFD700" : "#ccc"}
        />
      ))}
      <span className="rating-text">({rating.toFixed(1)})</span>
    </div>
  );
};

// Review Component
const ReviewSection = ({ placeId }) => {
  const [loading, setLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    const fetchReviewData = async () => {
      if (!placeId) return;
      
      setLoading(true);
      try {
        const reviewsResponse = await fetch(`${BASE_URL}/api/review/`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          
          let allReviews = [];
          if (Array.isArray(reviewsData)) {
            allReviews = reviewsData;
          } else if (reviewsData.data && Array.isArray(reviewsData.data)) {
            allReviews = reviewsData.data;
          }
          
          const placeReviews = allReviews.filter(review => 
            review.reviewedItem && 
            review.reviewedItem._id === placeId && 
            review.reviewedModel === "Place"
          );
          
          if (placeReviews.length > 0) {
            const totalRating = placeReviews.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(totalRating / placeReviews.length);
          } else {
            setAverageRating(null);
          }
        }
      } catch (error) {
        console.error("Error fetching review data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [placeId]);

  if (loading) return null;
  
  return (
    <div className="reviews-section">
      <div className="reviews-header">
        {averageRating !== null ? (
          <div className="average-rating">
            <StarRating rating={averageRating} size={12} />
            <span className="rating-text">({averageRating.toFixed(1)})</span>
          </div>
        ) : (
          <div className="no-reviews-text">N/A</div>
        )}
      </div>
    </div>
  );
};

const Places = () => {
  const navigate = useNavigate();
  const location = useRouterLocation(); 
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [selectedCity, setSelectedCity] = useState("all");
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [hoveredPlace, setHoveredPlace] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [placesWithDistances, setPlacesWithDistances] = useState([]);
  const [radius, setRadius] = useState(10);
  const [availableCities, setAvailableCities] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Refs to track state and prevent infinite loops
  const locationRequested = useRef(false);
  const prevFilters = useRef({});
  const isInitialMount = useRef(true);
  const observerRef = useRef(null);

  // Initial scroll effects
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]); 
  
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Fetch available cities from database
  useEffect(() => {
    const fetchAvailableCities = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/place/cities`);
        if (response.ok) {
          const data = await response.json();
          console.log("Cities API response:", data);
          if (data.success && data.data) {
            // Combine database cities with default cities, ensuring no duplicates
            const dbCities = data.data.map(city => city.toLowerCase());
            console.log("Database cities:", dbCities);
            const defaultCities = ['kathmandu', 'lalitpur', 'bhaktapur', 'pokhara', 'janakpur', 'chitwan', 'lumbini', 'nagarkot', 'bandipur', 'gorkha', 'mustang', 'everest'];
            const allCities = [...new Set([...defaultCities, ...dbCities])];
            console.log("All available cities:", allCities);
            setAvailableCities(allCities);
          } else {
            // If API response is invalid, use default cities
            console.log("Using default cities due to invalid API response");
            setAvailableCities(['kathmandu', 'lalitpur', 'bhaktapur', 'pokhara', 'janakpur', 'chitwan', 'lumbini', 'nagarkot', 'bandipur', 'gorkha', 'mustang', 'everest']);
          }
        } else {
          // If API call fails, use default cities
          console.log("Using default cities due to API failure");
          setAvailableCities(['kathmandu', 'lalitpur', 'bhaktapur', 'pokhara', 'janakpur', 'chitwan', 'lumbini', 'nagarkot', 'bandipur', 'gorkha', 'mustang', 'everest']);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
        // Fallback to default cities if API fails
        setAvailableCities(['kathmandu', 'lalitpur', 'bhaktapur', 'pokhara', 'janakpur', 'chitwan', 'lumbini', 'nagarkot', 'bandipur', 'gorkha', 'mustang', 'everest']);
      }
    };

    fetchAvailableCities();
  }, []);

  // Main useEffect for fetching places - OPTIMIZED
  useEffect(() => {
    // Always fetch places on initial mount to show all places
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Fetch all places initially
      const fetchInitialPlaces = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${BASE_URL}/api/place?limit=30&page=1`);
          if (res.ok) {
            const data = await res.json();
            setPlaces(data.data || []);
            setTotalPages(data.pages || 1);
            setCurrentPage(1);
            setHasMore(data.page < data.pages);
          }
        } catch (err) {
          console.error("Initial fetch error:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchInitialPlaces();
      return;
    }

    // Don't fetch if we're using location but don't have coordinates yet
    if (useLocation && !userLocation) return;

    console.log(userLocation);

    // Check if filters have actually changed
    const currentFilters = { searchQuery, selectedCity, selectedCategory, useLocation, radius };
    const filtersChanged = JSON.stringify(currentFilters) !== JSON.stringify(prevFilters.current);
    
    if (!filtersChanged && !isInitialMount.current) {
      return;
    }

    prevFilters.current = currentFilters;
    isInitialMount.current = false;

    // Reset pagination when filters change
    setCurrentPage(1);

    const fetchPlaces = async () => {
      setLoading(true);
      setError("");

      try {
        let url = `${BASE_URL}/api/place?limit=30&page=1`;
        const params = new URLSearchParams();
        
        params.append('limit', '30');
        params.append('page', '1');

        if (searchQuery) params.append("search", searchQuery);
        if (selectedCity !== "all") {
          // Canonical city values for API filter (avoid display names like "Lalitpur (Patan)")
          const cityQueryMap = {
            kathmandu: "Kathmandu",
            lalitpur: "Lalitpur",
            bhaktapur: "Bhaktapur",
            pokhara: "Pokhara",
            janakpur: "Janakpur",
            chitwan: "Chitwan",
            lumbini: "Lumbini",
            nagarkot: "Nagarkot",
            bandipur: "Bandipur",
            gorkha: "Gorkha",
            mustang: "Mustang",
            everest: "Everest Region",
          };
          const cityName = cityQueryMap[selectedCity] || (selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1));
          params.append("city", cityName);
          console.log("Adding city filter:", selectedCity, "->", cityName);
        }
        if (selectedCategory !== "all") params.append("category", selectedCategory);
        
        // Only add location if explicitly using it and we have coordinates
        if (useLocation && userLocation) {
          params.append("lat", userLocation.lat);
          params.append("lng", userLocation.lng);
          params.append("radius", radius);
        }

        url = `${BASE_URL}/api/place?${params.toString()}`;
        console.log("Fetching places from:", url);
        console.log("Selected city:", selectedCity);
        console.log("Params:", params.toString());

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

        const data = await res.json();
        console.log("Places API response:", data);
        console.log("Places found:", data.data?.length || 0);
        setPlaces(data.data || []);
        setTotalPages(data.pages || 1);
        setCurrentPage(1);
        setHasMore(data.page < data.pages);
      } catch (err) {
        setError("Failed to load places. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Use a timeout to debounce rapid changes
    const timer = setTimeout(() => {
      fetchPlaces();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCity, selectedCategory, useLocation, userLocation, radius]);

  // Handle location separately - FIXED VERSION
  useEffect(() => {
    if (useLocation && !locationRequested.current) {
      locationRequested.current = true;
      
      if (navigator.geolocation) {
        console.log("Requesting user location...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // THIS IS THE LINE THAT ACTUALLY FETCHES THE USER'S LOCATION
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            
            console.log("Location fetched successfully:", { userLat, userLng });
            
            setUserLocation({
              lat: userLat,
              lng: userLng,
            });
          },
          (err) => {
            console.error("Geolocation error:", err);
            let errorMessage = "Location access denied or unavailable.";
            
            // Provide more specific error messages
            switch(err.code) {
              case err.PERMISSION_DENIED:
                errorMessage = "Location access was denied. Please enable location permissions and try again.";
                break;
              case err.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable. Please try again.";
                break;
              case err.TIMEOUT:
                errorMessage = "Location request timed out. Please try again.";
                break;
              default:
                errorMessage = "An unknown error occurred while fetching location.";
                break;
            }
            
            setErrorModal({ open: true, message: errorMessage });
            setUseLocation(false);
            locationRequested.current = false;
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, // Increased timeout
            maximumAge: 300000 // Allow cached location up to 5 minutes
          }
        );
      } else {
        setErrorModal({ open: true, message: "Geolocation is not supported by your browser." });
        setUseLocation(false);
        locationRequested.current = false;
      }
    }
    
    // Reset location requested when turning off location
    if (!useLocation) {
      locationRequested.current = false;
      setUserLocation(null);
    }
  }, [useLocation]);

  // Calculate distances
  useEffect(() => {
    if (userLocation && useLocation && places.length > 0) {
      const placesWithDist = places.map((place) => {
        if (!place.location?.coordinates || place.location.coordinates.length !== 2) {
          return { ...place, distance: null, isWithinRadius: false };
        }

        const [lng, lat] = place.location.coordinates;
        const distance = calculateDistance(userLocation.lat, userLocation.lng, lat, lng);

        return { ...place, distance, isWithinRadius: distance <= radius };
      });

      setPlacesWithDistances(placesWithDist);
    } else {
      setPlacesWithDistances([]);
    }
  }, [userLocation, useLocation, places, radius]);

  const filteredPlaces = useMemo(() => {
    let result = places;

    if (useLocation && userLocation && placesWithDistances.length > 0) {
      result = placesWithDistances.filter((place) => place.isWithinRadius);
    }

    return result.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });
  }, [places, placesWithDistances, useLocation, userLocation]);

  const handleCityClick = (city) => {
    console.log("City clicked:", city);
    setSelectedCity(city);
    setUseLocation(false);
    setSearchQuery("");
  };

  const toggleLocation = () => {
    setUseLocation(!useLocation);
    if (!useLocation) {
      setSelectedCity("all");
      setSearchQuery("");
    }
  };

  const toggleFavorite = (placeId) => {
    setFavorites((prev) =>
      prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
    );
  };

  const handleSearch = (e) => e.preventDefault();

  const handleViewMap = (lat, lng) => {
    if (!lat || !lng) {
      alert("Location coordinates not available for this place.");
      return;
    }

    if (userLocation) {
      // If user location is available, show directions
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving&zoom=15`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // If no user location, show the place directly with a marker
      const url = `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},15z`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleReadMore = (placeId) => navigate(`/placedetails/${placeId}`);

  const getCategoryIcon = (category) =>
    categories.find((c) => c.id === category)?.icon || <Info size={16} />;

  const truncateDescription = (text, maxLength) =>
    text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text || "";

  // Load more places function
  const loadMorePlaces = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      let url = `${BASE_URL}/api/place?limit=30&page=${nextPage}`;
      const params = new URLSearchParams();
      
      params.append('limit', '30');
      params.append('page', nextPage.toString());

      if (searchQuery) params.append("search", searchQuery);
      if (selectedCity !== "all") {
        const cityQueryMap = {
          kathmandu: "Kathmandu",
          lalitpur: "Lalitpur",
          bhaktapur: "Bhaktapur",
          pokhara: "Pokhara",
          janakpur: "Janakpur",
          chitwan: "Chitwan",
          lumbini: "Lumbini",
          nagarkot: "Nagarkot",
          bandipur: "Bandipur",
          gorkha: "Gorkha",
          mustang: "Mustang",
          everest: "Everest Region",
        };
        const cityName = cityQueryMap[selectedCity] || (selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1));
        params.append("city", cityName);
      }
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      
      if (useLocation && userLocation) {
        params.append("lat", userLocation.lat);
        params.append("lng", userLocation.lng);
        params.append("radius", radius);
      }

      url = `${BASE_URL}/api/place?${params.toString()}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const data = await res.json();
      setPlaces(prev => [...prev, ...(data.data || [])]);
      setCurrentPage(nextPage);
      setHasMore(data.page < data.pages);
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
    <div className="places-page">
      <Navbar />
      <Header />
      <div className="places-container">
        {/* Sidebar with Search and Filters */}
        <div className="places-sidebar">
          <div className="places-header">
            <div className="places-title">
              <h1>Explore Nepal</h1>
              <p>Discover heritage sites, cultural experiences, and hidden gems</p>
            </div>
            <div className="places-count">
              <MapPin size={18} />
              <span>{filteredPlaces.length} places to explore</span>
            </div>
          </div>

          <div className="places-controls">
            <form onSubmit={handleSearch} className="places-search-form">
              <div className="search-input-container">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search places, categories, cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-search"
                    onClick={() => setSearchQuery("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            <div className="places-city-selector">
              <button
                className={`places-city-btn ${selectedCity === "all" && !useLocation ? "active" : ""}`}
                onClick={() => handleCityClick("all")}
              >
                All Cities
              </button>
              {availableCities.map((cityKey) => (
                <button
                  key={cityKey}
                  className={`places-city-btn ${selectedCity === cityKey ? "active" : ""}`}
                  onClick={() => handleCityClick(cityKey)}
                >
                  {cityData[cityKey]?.icon || <Landmark size={16} />} 
                  {cityData[cityKey]?.name || cityKey.charAt(0).toUpperCase() + cityKey.slice(1)}
                </button>
              ))}
              <button
                className={`places-city-btn ${useLocation ? "active" : ""}`}
                onClick={toggleLocation}
              >
                <MapPin size={16} /> Near Me
              </button>
            </div>

            {useLocation && userLocation && (
              <div className="radius-control">
                <label>Radius: {radius} km</label>
                <input
                  type="range"
                  min="1"
                  max="500"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </div>
            )}

            <div className="category-filters">
              <button
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} /> {showFilters ? "Hide Filters" : "Show Filters"}
              </button>

              {showFilters && (
                <div className="category-buttons">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`category-btn ${selectedCategory === category.id ? "active" : ""}`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="places-main-content">
          {loading && (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Loading places...</p>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <Info size={24} />
              <p>{error}</p>
            </div>
          )}

          {useLocation && userLocation && (
            <div className="location-info">
              <MapPin size={16} />
              <span>
                Showing places within {radius} km of your location
                ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              </span>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <div className="loader"></div>
              <p>Discovering amazing places...</p>
            </div>
          ) : (
            <>
              {selectedCity === "all" ? (
                <div></div>
              ) : (
                (() => {
                  const cityInfo = cityData[selectedCity] || {
                    name: selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1),
                    icon: <Landmark size={20} />,
                    color: "#475569",
                    description: "",
                  };
                  return (
                    <div className="city-details">
                      <h2>{cityInfo.icon} Explore {cityInfo.name}</h2>
                      <p>{getCityDescription(selectedCity)}</p>

                      <div className="city-tips">
                        <h3><Info size={18} /> Travel Tips</h3>
                        <ul>
                          {getCityTips(selectedCity).map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })()
              )}

              <div className="places-grid">
                {filteredPlaces.length === 0 ? (
                  <div className="empty-places">
                    <p>No places found {searchQuery ? `matching "${searchQuery}"` : ""}</p>
                    <button onClick={() => {
                      setSelectedCategory("all");
                      setSearchQuery("");
                      setSelectedCity("all");
                    }}>
                      View all places
                    </button>
                  </div>
                ) : (
                  filteredPlaces.map((place) => {
                    return (
                    <div
                      key={place._id}
                      className="place-card"
                      onMouseEnter={() => setHoveredPlace(place)}
                      onMouseLeave={() => setHoveredPlace(null)}
                    >
                      <div className="image-container">
                        <img
                          src={place.img || '/images/placeholder.jpg'}
                          alt={place.name}
                          className="place-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/placeholder.jpg";
                          }}
                        />
                        <button
                          className={`favorite-btn ${favorites.includes(place._id) ? "favorited" : ""}`}
                          onClick={() => toggleFavorite(place._id)}
                        >
                          <Heart
                            size={18}
                            fill={favorites.includes(place._id) ? "currentColor" : "none"}
                          />
                        </button>
                        {place.isPopular && (
                          <div className="popular-badge">
                            <Star size={14} fill="currentColor" /> Popular
                          </div>
                        )}
                      </div>

                      <div className="place-info">
                        <h3>{place.name}</h3>
                        <div className="place-meta">
                          {(() => {
                            const cityKey = (place.city || '').toString().toLowerCase();
                            const meta = cityData[cityKey];
                            return (
                              <>
                                <span className="category">
                                  {getCategoryIcon(place.category)} {place.category}
                                </span>
                                <span className="city" style={{ color: meta?.color }}>
                                  {meta?.name || place.city}
                                </span>
                                {place.distance !== undefined && (
                                  <span className="distance">
                                    {place.distance?.toFixed(1)} km away
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>

                        <p className="description">
                          {truncateDescription(place.description, 100)}
                        </p>

                        {/* Reviews Section
                        <ReviewSection placeId={place._id} /> */}

                        {place.description && place.description.length > 100 && (
                          <button
                            className="read-more-btn"
                            onClick={() => handleReadMore(place._id)}
                          >
                            Read More
                          </button>
                        )}

                        {hoveredPlace === place && place.location?.coordinates && (
                          <div className="hover-details">
                            <div><strong>Entry Fee:</strong> {place.entryFee || "Free"}</div>
                            <div><strong>Best Time:</strong> {place.bestTime || "Morning"}</div>
                            <div><strong>Duration:</strong> {place.duration || "1-2 hours"}</div>

                            <button
                              className="map-btn"
                              onClick={() => handleViewMap(
                                place.location.coordinates[1],
                                place.location.coordinates[0]
                              )}
                            >
                              <Navigation size={16} /> Get Directions
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })
                )}
              </div>
              
              {/* Load More Button */}
              {!loading && hasMore && filteredPlaces.length > 0 && (
                <div className="load-more-container">
                  <button 
                    className="load-more-btn"
                    onClick={loadMorePlaces}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <div className="loader-small"></div>
                        Loading more places...
                      </>
                    ) : (
                      'Load More Places'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Travel Guide and Tips Section */}
      <div className="travel-guide-container">
        <div className="container-inner">
          <div className="travel-guide">
            <h2><MapPin size={24} /> Kathmandu Valley Travel Guide</h2>

            <div className="guide-section">
              <h3><Landmark size={20} /> UNESCO World Heritage Sites</h3>
              <div className="heritage-grid">
                {heritageSites.map((site) => (
                  <div key={site.name} className="heritage-card">
                    <h4>{site.name}</h4>
                    <p>{site.city}</p>
                    <p><strong>Significance:</strong> {site.significance}</p>
                    <p><strong>Feature:</strong> {site.feature}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="guide-section">
              <h3><Utensils size={20} /> Local Experiences</h3>
              <div className="experiences-grid">
                {localExperiences.map((experience) => (
                  <div key={experience.title} className="experience-card">
                    <h4>{experience.title}</h4>
                    <p>{experience.description}</p>
                    <p><strong>Where:</strong> {experience.location}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="visiting-tips">
            <div className="tips-content">
              <div className="disclaimer">
                <h4><Info size={20} /> Visiting Tips:</h4>
                <ul>
                  <li>Respect local customs - remove shoes before temples</li>
                  <li>Dress modestly at religious sites</li>
                  <li>Hire licensed guides at heritage sites</li>
                </ul>
              </div>

              <div className="emergency-info">
                <h4><Info size={20} /> Essential Contacts:</h4>
                <p><strong>Tourist Police:</strong> 1144</p>
                <p><strong>Archaeology Dept:</strong> +977-1-4250683</p>
                <p><strong>Emergency Ambulance:</strong> 102</p>
              </div>
            </div>
          </div>
          {/* New Footer section */}
          <div>
        <Footer />
      </div>
        </div>
      </div>
      {/* Previous footer section */}
    </div>
    {errorModal.open && (
      <div
        className="places-modal-overlay"
        role="dialog"
        aria-modal="true"
        onClick={() => setErrorModal({ open: false, message: "" })}
      >
        <div className="places-modal" onClick={(e) => e.stopPropagation()}>
          <h3>Something went wrong</h3>
          <p>{errorModal.message}</p>
          <div className="places-modal-actions">
            <button
              className="places-ghost-btn"
              onClick={() => setErrorModal({ open: false, message: "" })}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default Places;