import React, { useState, useContext, useRef, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Feature from "../../components/featured/Featured";
import FeaturedProperties from "../../components/featuredProperties/FeaturedProperties";
import PropertyList from "../../components/propertyList/PropertyList";
import MailList from "../../components/mailList/MailList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBed, faCalendarDays, faPerson, faMagnifyingGlass, faMapMarkerAlt, faBuilding, faHome, faHotel } from "@fortawesome/free-solid-svg-icons";
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext";
import { Heart, Star, MapPin, Map, Plane, CheckCircle, XCircle, RefreshCw, Home as HomeIcon } from "lucide-react";
import "./stays.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import useFetch from "../../hooks/useFetch";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8800";

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

const Stays = () => {
    const [destination, setDestination] = useState("");
    const [openDate, setOpenDate] = useState(false);
    const [dates, setDates] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
        },
    ]);
    const [openOptions, setOpenOptions] = useState(false);
    const [options, setOptions] = useState({
        adult: 1,
        children: 0,
        room: 1,
    });
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(1000);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchUrl, setSearchUrl] = useState("");
    const [favorites, setFavorites] = useState(new Set());
    const [hotelReviews, setHotelReviews] = useState({});

    const dateRef = useRef();
    const optionsRef = useRef();
    const resultsRef = useRef();
    const refinedDateRef = useRef(); // Separate ref for refined search date picker
    const [openRefinedDate, setOpenRefinedDate] = useState(false); // Separate state for refined search

    const { dispatch } = useContext(SearchContext);
    const navigate = useNavigate();

    // Build search URL with all filters
    const buildSearchUrl = (dest, minPrice, maxPrice, category) => {
        let url = `${BASE_URL}/api/hotels?`;
        const params = new URLSearchParams();
        
        if (dest) params.append("city", dest);
        if (minPrice) params.append("min", minPrice);
        if (maxPrice) params.append("max", maxPrice);
        if (category && category !== "all") params.append("type", category);
        
        return url + params.toString();
    };

    // Fetch search results
    const { data: searchResults, loading: searchLoading, error: searchError } = useFetch(
        showSearchResults ? searchUrl : null
    );

    // Stay categories with icons and descriptions
    const stayCategories = [
        {
            id: "hotel",
            name: "Hotels",
            icon: faHotel,
            description: "Luxury and comfort in the heart of the city",
            color: "#4a6cf7"
        },
        {
            id: "resort",
            name: "Resorts",
            icon: faBuilding,
            description: "Relaxing getaways with premium amenities",
            color: "#10b981"
        },
        {
            id: "guesthouse",
            name: "Guesthouses",
            icon: faHome,
            description: "Cozy local accommodations with personal touch",
            color: "#f59e0b"
        },
        {
            id: "homestay",
            name: "Homestays",
            icon: faHome,
            description: "Authentic local living experience",
            color: "#ef4444"
        },
        {
            id: "apartment",
            name: "Apartments",
            icon: faBuilding,
            description: "Spacious accommodations for longer stays",
            color: "#8b5cf6"
        },
        {
            id: "villa",
            name: "Villas",
            icon: faHome,
            description: "Private luxury accommodations",
            color: "#06b6d4"
        }
    ];

    // Fetch featured properties
    const { data: featuredData, loading: featuredLoading } = useFetch(
        `${BASE_URL}/api/hotels?featured=true&limit=4`
    );

    // Fetch property list counts
    const { data: propertyListData } = useFetch(`${BASE_URL}/api/hotels/countByType`);

    // Fetch reviews for all hotels
    useEffect(() => {
        const fetchReviews = async () => {
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
                    
                    const reviewsByHotel = {};
                    allReviews.forEach(review => {
                        if (review.reviewedItem && review.reviewedModel === "Hotel") {
                            const hotelId = review.reviewedItem._id;
                            if (!reviewsByHotel[hotelId]) {
                                reviewsByHotel[hotelId] = [];
                            }
                            reviewsByHotel[hotelId].push(review);
                        }
                    });
                    
                    setHotelReviews(reviewsByHotel);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };

        fetchReviews();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dateRef.current && !dateRef.current.contains(e.target)) {
                setOpenDate(false);
            }
            if (refinedDateRef.current && !refinedDateRef.current.contains(e.target)) {
                setOpenRefinedDate(false);
            }
            if (optionsRef.current && !optionsRef.current.contains(e.target)) {
                setOpenOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleOption = (name, operation) => {
        setOptions((prev) => ({
            ...prev,
            [name]: operation === "i" ? prev[name] + 1 : Math.max(prev[name] - 1, (name === "adult" || name === "room") ? 1 : 0),
        }));
    };

    const handleSearch = () => {
        if (!destination.trim()) {
            alert("Please enter a destination");
            return;
        }

        dispatch({
            type: "NEW_SEARCH",
            payload: {
                destination,
                dates,
                options,
                min,
                max
            }
        });

        // Show search results on the same page instead of navigating
        const url = buildSearchUrl(destination, min, max, selectedCategory);
        setSearchUrl(url);
        setShowSearchResults(true);
        
        // Scroll to results
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const toggleFavorite = (id) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(id)) {
            newFavorites.delete(id);
        } else {
            newFavorites.add(id);
        }
        setFavorites(newFavorites);
    };

    // Calculate average rating for a hotel
    const getHotelRating = (hotelId) => {
        const reviews = hotelReviews[hotelId];
        if (!reviews || reviews.length === 0) return null;
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / reviews.length;
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleCategoryClick = (categoryId) => {
        setSelectedCategory(categoryId);
        
        // Show filtered results on same page instead of navigating
        const url = buildSearchUrl(destination, min, max, categoryId);
        setSearchUrl(url);
        setShowSearchResults(true);
        
        // Scroll to results
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    return (
        <div className="staysPage">
            <Navbar />
            <Header />

            {/* Modern Search Bar */}
            <div className="searchSection">
                <div className="searchContainer">
                    <h2 className="searchTitle">Find your perfect stay</h2>
                    <p className="searchSubtitle">Search deals on hotels, homes, and much more...</p>

                    <div className="searchBar">
                        <div className="searchItem">
                            <div className="inputGroup">
                                <FontAwesomeIcon icon={faBed} className="searchIcon" />
                                <input
                                    type="text"
                                    placeholder="Where are you going?"
                                    className="searchInput"
                                    value={destination}
                                    onChange={(e) => setDestination(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                        </div>

                        <div className="searchItem" ref={dateRef}>
                            <div className="inputGroup">
                                <FontAwesomeIcon icon={faCalendarDays} className="searchIcon" />
                                <div
                                    onClick={() => setOpenDate(!openDate)}
                                    className="searchText"
                                >
                                    {`${format(dates[0].startDate, "MMM dd")} - ${format(dates[0].endDate, "MMM dd")}`}
                                </div>
                            </div>
                            {openDate && (
                                <div className="datePickerContainer">
                                    <DateRange
                                        editableDateInputs={true}
                                        onChange={(item) => setDates([item.selection])}
                                        moveRangeOnFirstSelection={false}
                                        ranges={dates}
                                        className="datePicker"
                                        minDate={new Date()}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="searchItem" ref={optionsRef}>
                            <div className="inputGroup">
                                <FontAwesomeIcon icon={faPerson} className="searchIcon" />
                                <div
                                    onClick={() => setOpenOptions(!openOptions)}
                                    className="searchText"
                                >
                                    {`${options.adult} adult · ${options.children} children · ${options.room} room`}
                                </div>
                            </div>
                            {openOptions && (
                                <div className="optionsDropdown">
                                    {["adult", "children", "room"].map((key) => (
                                        <div className="optionItem" key={key}>
                                            <span className="optionLabel">
                                                {key.charAt(0).toUpperCase() + key.slice(1)}
                                            </span>
                                            <div className="optionControls">
                                                <button
                                                    disabled={options[key] <= (key === "adult" || key === "room" ? 1 : 0)}
                                                    className="optionBtn"
                                                    onClick={() => handleOption(key, "d")}
                                                >
                                                    -
                                                </button>
                                                <span className="optionValue">{options[key]}</span>
                                                <button
                                                    className="optionBtn"
                                                    onClick={() => handleOption(key, "i")}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="searchItem">
                            <button className="searchBtn" onClick={handleSearch}>
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                                <span>Search</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Results Section */}
            {showSearchResults && (
                <div className="searchResultsSection" ref={resultsRef}>
                    <div className="resultsContainer">
                        {/* Refined Search Panel */}
                        <div className="refinedSearchPanel">
                            <div className="searchPanelHeader">
                                <h3>Refine your search</h3>
                                <p>Find the perfect accommodation for your trip</p>
                                <button 
                                    className="clearSearchBtn"
                                    onClick={() => setShowSearchResults(false)}
                                >
                                    ← Back to Browse
                                </button>
                            </div>

                            <div className="searchFilters">
                                <div className="filterGroup">
                                    <label>
                                        <FontAwesomeIcon icon={faBed} className="filterIcon" />
                                        Destination
                                    </label>
                                    <input
                                        type="text"
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        placeholder="City or property name"
                                        className="modernInput"
                                    />
                                </div>

                                <div className="filterGroup" ref={refinedDateRef}>
                                    <label>
                                        <FontAwesomeIcon icon={faCalendarDays} className="filterIcon" />
                                        Dates
                                    </label>
                                    <div
                                        className="dateDisplay"
                                        onClick={() => setOpenRefinedDate(!openRefinedDate)}
                                    >
                                        {`${format(dates[0].startDate, "MMM dd")} - ${format(dates[0].endDate, "MMM dd")}`}
                                    </div>
                                    {openRefinedDate && (
                                        <div className="datePickerWrapper">
                                            <DateRange
                                                editableDateInputs={true}
                                                onChange={(item) => setDates([item.selection])}
                                                moveRangeOnFirstSelection={false}
                                                ranges={dates}
                                                minDate={new Date()}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="filterGroup">
                                    <label>
                                        <FontAwesomeIcon icon={faMagnifyingGlass} className="filterIcon" />
                                        Price range
                                    </label>
                                    <div className="priceRangeInputs">
                                        <input
                                            type="number"
                                            value={min}
                                            onChange={(e) => setMin(e.target.value)}
                                            placeholder="Min"
                                            className="modernInput"
                                        />
                                        <span className="rangeSeparator">→</span>
                                        <input
                                            type="number"
                                            value={max}
                                            onChange={(e) => setMax(e.target.value)}
                                            placeholder="Max"
                                            className="modernInput"
                                        />
                                    </div>
                                </div>

                                <div className="filterGroup">
                                    <label>
                                        <FontAwesomeIcon icon={faHome} className="filterIcon" />
                                        Property Type
                                    </label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="modernInput"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="hotel">Hotels</option>
                                        <option value="resort">Resorts</option>
                                        <option value="guesthouse">Guesthouses</option>
                                        <option value="homestay">Homestays</option>
                                        <option value="apartment">Apartments</option>
                                        <option value="villa">Villas</option>
                                    </select>
                                </div>

                                <div className="filterGroup">
                                    <label>
                                        <FontAwesomeIcon icon={faPerson} className="filterIcon" />
                                        Guests & Rooms
                                    </label>
                                    <div className="guestSummary">
                                        {options.adult} adults • {options.children} children • {options.room} rooms
                                    </div>
                                </div>

                                <button className="updateSearchButton" onClick={() => {
                                    const url = buildSearchUrl(destination, min, max, selectedCategory);
                                    setSearchUrl(url);
                                }}>
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                    Update results
                                </button>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="resultsSection">
                            <div className="resultsHeader">
                                <h2>
                                    {destination ? (
                                        <>Stays in <span className="highlight">{destination}</span></>
                                    ) : selectedCategory !== "all" ? (
                                        <>Showing <span className="highlight">{selectedCategory}s</span></>
                                    ) : (
                                        "Available Properties"
                                    )}
                                </h2>
                                <p className="resultsCount">{searchResults?.length || 0} properties found</p>
                            </div>

                        {searchLoading ? (
                            <div className="loadingState">
                                <div className="loadingSpinner"></div>
                                <p>Discovering amazing stays...</p>
                            </div>
                        ) : searchError ? (
                            <div className="errorState">
                                <XCircle size={48} className="errorIcon" />
                                <p>We couldn't load properties. Please try again.</p>
                                <button onClick={handleSearch} className="retryButton">
                                    <RefreshCw size={16} />
                                    Retry
                                </button>
                            </div>
                        ) : searchResults && searchResults.length > 0 ? (
                            <div className="hotelsGrid">
                                {searchResults.map((hotel) => {
                                    const reviews = hotelReviews[hotel._id] || [];
                                    const averageRating = getHotelRating(hotel._id);
                                    const reviewCount = reviews.length;
                                    
                                    return (
                                        <div className="hotelCard" key={hotel._id}>
                                            <div className="hotelImageContainer">
                                                <img
                                                    src={hotel.photos?.[0] || "/placeholder-hotel.jpg"}
                                                    alt={hotel.name}
                                                    className="hotelImage"
                                                />
                                                <button
                                                    className={`favoriteButton ${favorites.has(hotel._id) ? "active" : ""}`}
                                                    onClick={() => toggleFavorite(hotel._id)}
                                                >
                                                    <Heart size={18} fill={favorites.has(hotel._id) ? "currentColor" : "none"} />
                                                </button>
                                                {hotel.featured && (
                                                    <div className="featuredBadge">
                                                        <Star size={12} fill="currentColor" />
                                                        Featured
                                                    </div>
                                                )}
                                            </div>
                                            <div className="hotelDetails">
                                                <div className="hotelInfo">
                                                    <h3>{hotel.name}</h3>
                                                    <div className="location">
                                                        <MapPin size={14} />
                                                        <span>{hotel.city}</span>
                                                    </div>
                                                    
                                                    {/* Rating Section */}
                                                    <div className="rating-section">
                                                        {averageRating !== null ? (
                                                            <div className="rating-badge">
                                                                <StarRating rating={averageRating} size={14} />
                                                                <span className="review-count">
                                                                    {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="rating-badge">
                                                                <span className="no-rating">No reviews yet</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="amenities">
                                                        {hotel.distance && (
                                                            <span>
                                                                <Map size={12} />
                                                                {hotel.distance}m from center
                                                            </span>
                                                        )}
                                                        {hotel.free_airport_taxi && (
                                                            <span>
                                                                <Plane size={12} />
                                                                Free airport taxi
                                                            </span>
                                                        )}
                                                        {hotel.free_cancellation && (
                                                            <span>
                                                                <CheckCircle size={12} />
                                                                Free cancellation
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="description">{hotel.desc?.substring(0, 120)}...</p>
                                                </div>
                                                <div className="hotelPricing">
                                                    <div className="price">
                                                        <span className="amount">Rs. {hotel.cheapestPrice}</span>
                                                        <span className="perNight">/ night</span>
                                                    </div>
                                                    <button
                                                        className="viewButton"
                                                        onClick={() => navigate(`/hotels/${hotel._id}`)}
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="emptyState">
                                <HomeIcon size={48} className="emptyIcon" />
                                <h3>No properties match your search</h3>
                                <p>Try adjusting your filters or search in a different area</p>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            )}

            <div className="stayContainer">
                <h1 className="sectionTitle">Browse by Cities</h1>
                <Feature />
                
                <h1 className="sectionTitle">Browse by property type</h1>
                <PropertyList propertyList={propertyListData} />
                
                {/* New Categories Section */}
                <h1 className="sectionTitle">Explore by category</h1>
                <div className="categoriesSection">
                    <div className="categoriesGrid">
                        {stayCategories.map((category) => (
                            <div 
                                key={category.id}
                                className={`categoryCard ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => handleCategoryClick(category.id)}
                                style={{ '--category-color': category.color }}
                            >
                                <div className="categoryIcon">
                                    <FontAwesomeIcon icon={category.icon} />
                                </div>
                                <h3 className="categoryName">{category.name}</h3>
                                <p className="categoryDescription">{category.description}</p>
                                <div className="categoryArrow">→</div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <h1 className="sectionTitle">Homes guests love</h1>
                <FeaturedProperties featuredProperties={featuredData} loading={featuredLoading} />
                <MailList />
                <Footer />
            </div>
        </div>
    );
};

export default Stays;