import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, Navigation, ArrowLeft, Info, Calendar, Users, Star, MapPin } from "lucide-react";
import useFetch from "../../hooks/useFetch";
import "./hotelDetails.css";
import Navbar from "../../components/navbar/Navbar";
import Reserve from "../../components/reserve/Reserve";
import { SearchContext } from "../../context/SearchContext";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8800";

// Star Rating Component
const StarRating = ({ rating, size = 16, showEmpty = false }) => {
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

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(`${BASE_URL}/api/hotels/${id}`);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const { dates, options } = useContext(SearchContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch reviews for this hotel
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      setReviewsLoading(true);
      try {
        // Get all reviews and filter for this hotel
        const reviewsResponse = await fetch(`${BASE_URL}/api/review/`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          
          // Handle different response structures
          let allReviews = [];
          if (Array.isArray(reviewsData)) {
            allReviews = reviewsData;
          } else if (reviewsData.data && Array.isArray(reviewsData.data)) {
            allReviews = reviewsData.data;
          }
          
          // Filter reviews for this specific hotel
          const hotelReviews = allReviews.filter(review => 
            review.reviewedItem && 
            review.reviewedItem._id === id && 
            review.reviewedModel === "Hotel"
          );
          
          setReviews(hotelReviews);
          
          // Calculate average rating
          if (hotelReviews.length > 0) {
            const totalRating = hotelReviews.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(totalRating / hotelReviews.length);
          } else {
            setAverageRating(null);
          }
        } else {
          console.error("Failed to fetch reviews:", reviewsResponse.status);
        }
      } catch (error) {
        console.error("Error fetching review data:", error);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (data) {
      fetchReviews();
    }
  }, [id, data]);

  const calculateNights = () => {
    if (!dates?.[0]) return 1;
    const start = new Date(dates[0].startDate);
    const end = new Date(dates[0].endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();

  const calculateTotalPrice = () => {
    if (!data) return null;
    const pricePerNight = data.cheapestPrice ? Number(data.cheapestPrice) : 0;
    if (!dates || !options) return pricePerNight;
    const numberOfRooms = Number(options.room) || 1;
    return pricePerNight * numberOfRooms * nights;
  };

  const totalPrice = calculateTotalPrice();

  const handleReserveClick = () => {
    if (user) {
      setOpenModal(true);
    } else {
      navigate("/login");
    }
  };

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setUserLocation(location);
            setLocationError("");
            resolve(location);
          },
          (err) => {
            const errorMsg = `Location access denied: ${err.message}`;
            setLocationError(errorMsg);
            reject(errorMsg);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      } else {
        const errorMsg = "Geolocation is not supported by your browser";
        setLocationError(errorMsg);
        reject(errorMsg);
      }
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically make an API call to save to favorites
  };

  const handleGetDirections = async () => {
    try {
      // Check if hotel has coordinates
      const hasCoordinates = (data?.location?.coordinates && data.location.coordinates.length === 2) || 
                            (data?.latitude && data?.longitude);
      
      if (hasCoordinates) {
        // Use coordinates for precise location
        const lat = data.location?.coordinates?.[1] || data.latitude;
        const lng = data.location?.coordinates?.[0] || data.longitude;
        
        try {
          const currentLocation = userLocation || await getUserLocation();
          // Use coordinates for directions with user location
          const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${lat},${lng}&travelmode=driving&zoom=15`;
          window.open(url, "_blank", "noopener,noreferrer");
        } catch (locationErr) {
          // User denied location - just show hotel on map
          const url = `https://www.google.com/maps/place/${lat},${lng}/@${lat},${lng},15z`;
          window.open(url, "_blank", "noopener,noreferrer");
        }
      } else {
        // Fallback to hotel name search
        if (!data?.name) {
          throw new Error("Hotel location not available");
        }
        const destination = encodeURIComponent(data.name + (data.city ? ", " + data.city : ""));
        
        try {
          const currentLocation = userLocation || await getUserLocation();
          const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destination}&travelmode=driving`;
          window.open(url, "_blank", "noopener,noreferrer");
        } catch (locationErr) {
          // User denied location - just search for hotel
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${destination}`,
            "_blank",
            "noopener,noreferrer"
          );
        }
      }
    } catch (err) {
      setLocationError("Could not open directions. Please try again.");
      console.error("Directions error:", err);
    }
  };

  if (loading) return <div className="hotelDetails-loading">Loading hotel details...</div>;
  if (error || !data) return <div className="hotelDetails-error">Error loading hotel details.</div>;

  return (
    <>
      <Navbar />
      <div className="hotelDetails-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back to Stays
        </button>

        <div className="hotelDetails-header">
          <h1 className="hotelDetails-name">{data.name}</h1>
          <div className="rating-section">
            {averageRating !== null ? (
              <div className="rating-badge">
                <StarRating rating={averageRating} size={16} />
                <span className="review-count">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            ) : (
              <div className="rating-badge">
                <span className="no-rating">N/A</span>
              </div>
            )}
          </div>
          <div className="location-section">
            <MapPin size={18} />
            <span>{data.address || `${data.city}, ${data.type}`}</span>
            {((data.location?.coordinates && data.location.coordinates.length === 2) || 
              (data.latitude && data.longitude)) && (
              <button 
                className="directions-button"
                onClick={handleGetDirections}
                title="Get directions to this hotel"
              >
                <Navigation size={16} />
                <span>Get Directions</span>
              </button>
            )}
          </div>
          <span className="hotelDetails-type">{data.type}</span>
          <span className="hotelDetails-city">{data.city}</span>
          {data.cheapestPrice && (
            <span className="hotelDetails-price">From NPR {data.cheapestPrice} / night</span>
          )}
        </div>

        <div className="hotelDetails-actions">
          <button
            className={`favorite-button ${isFavorite ? "active" : ""}`}
            onClick={toggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            {isFavorite ? "Saved" : "Save"}
          </button>
        </div>

        {/* Embedded Google Maps for hotel location */}
        <div style={{ width: "100%", height: "350px", marginBottom: "24px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 24px rgba(67, 97, 238, 0.08)" }}>
          {(data?.location?.coordinates && data.location.coordinates.length === 2) ? (
            (() => {
              const [lng, lat] = data.location.coordinates;
              return (
                <iframe
                  title="Hotel Location Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`}
                />
              );
            })()
          ) : (data?.latitude && data?.longitude) ? (
            <iframe
              title="Hotel Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${data.latitude},${data.longitude}&hl=en&z=15&output=embed`}
            />
          ) : (
            <iframe
              title="Hotel Location Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(data.name + (data.city ? ", " + data.city : ""))}&hl=en&z=15&output=embed`}
            />
          )}
        </div>

        {locationError && (
          <div className="location-error">
            <Info size={16} />
            <p>{locationError}</p>
          </div>
        )}

        <div className="hotelDetails-images">
          {Array.isArray(data.photos) && data.photos.length > 0 ? (
            data.photos.map((photo, idx) => (
              <img key={idx} src={photo} alt={`Hotel ${data.name} ${idx + 1}`} className="hotelDetails-image" />
            ))
          ) : (
            <img src="https://via.placeholder.com/400x250?text=No+Image" alt="No hotel" className="hotelDetails-image" />
          )}
        </div>

        <div className="hotelDetails-content-grid">
          <div className="hotelDetails-desc">
            <h2>Description</h2>
            <p>{data.desc || "No description available."}</p>

            {/* Reviews Section */}
            <div className="reviews-section">
              <h3 className="section-title">Guest Reviews</h3>
              {reviewsLoading ? (
                <div className="reviews-loading">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review._id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">
                            {review.userId?.username?.charAt(0)?.toUpperCase() || 'G'}
                          </div>
                          <div className="reviewer-details">
                            <span className="reviewer-name">{review.userId?.username || 'Guest'}</span>
                            <StarRating rating={review.rating} size={14} />
                          </div>
                        </div>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="review-comment">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-reviews">
                  <p>No reviews yet. Be the first to review this hotel!</p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Section */}
          <div className="booking-section">
            <div className="booking-card">
              <h3 className="price-title">
                {totalPrice === null ? (
                  "Loading price..."
                ) : (
                  <>
                    NPR {totalPrice.toLocaleString()}
                    <span className="price-subtitle">
                      {nights > 1 ? ` for ${nights} nights` : " for 1 night"}
                    </span>
                  </>
                )}
              </h3>
              <div className="booking-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <div>
                    <p className="detail-label">Check-in / Check-out</p>
                    <p className="detail-value">
                      {dates?.[0]
                        ? `${new Date(dates[0].startDate).toLocaleDateString()} - ${new Date(dates[0].endDate).toLocaleDateString()}`
                        : "Select dates"}
                    </p>
                  </div>
                </div>
                <div className="detail-item">
                  <Users size={16} />
                  <div>
                    <p className="detail-label">Guests</p>
                    <p className="detail-value">
                      {options
                        ? `${options.adult || 0} adults, ${options.children || 0} children, ${options.room || 1} room`
                        : "1 room"}
                    </p>
                  </div>
                </div>
              </div>
              <button className="book-now-button" onClick={handleReserveClick}>
                Reserve Now
              </button>
            </div>
          </div>
        </div>
      </div>
      {openModal && <Reserve setOpen={setOpenModal} hotelId={id} />}
    </>
  );
};

export default HotelDetails;
