import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import "./tripDetails.css";

const PLACE_IMG_FALLBACK = "/images/1.jpg";

const getEntityImage = (entity, fallback = PLACE_IMG_FALLBACK) => {
    if (!entity) return fallback;
    const tryVal = (v) => (typeof v === "string" ? v : v?.url || v?.src || v?.secure_url);
    if (Array.isArray(entity.photos) && entity.photos.length) {
        const v = tryVal(entity.photos[0]);
        if (v) return v;
    }
    if (Array.isArray(entity.images) && entity.images.length) {
        const v = tryVal(entity.images[0]);
        if (v) return v;
    }
    const single = tryVal(entity.photo || entity.image || entity.img || entity.thumbnail);
    return single || fallback;
};

export default function TripDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTripDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchTripDetails = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get(`/trips/${id}`);
            setTrip(res.data.data || res.data);
        } catch (err) {
            setError("Failed to load trip details");
        } finally {
            setLoading(false);
        }
    };

    const fmtMins = (mins) => {
        if (!mins) return "0m";
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        return h ? `${h}h ${m}m` : `${m}m`;
    };

    const fmtDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="trip-details-container">
                    <p className="loading-text">Loading trip details...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div>
                <Navbar />
                <div className="trip-details-container">
                    <p className="error-text">{error || "Trip not found"}</p>
                    <button className="back-btn" onClick={() => navigate("/trips")}>
                        Back to Trips
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const cover = getEntityImage(trip.places?.[0]);
    const days = trip?.totals?.days || trip.itinerary?.length || 0;
    const totalTravel = fmtMins(trip?.totals?.totalTravelMinutes || 0);
    const totalFees = trip?.totals?.totalEntranceFees || 0;

    return (
        <div>
            <Navbar />
            <div className="trip-details-container">
                <div className="trip-details-header">
                    <button className="back-btn" onClick={() => navigate("/trips")}>
                        ← Back to Trips
                    </button>
                    <h1 className="trip-details-title">{trip.name}</h1>
                    <span className={`status-badge ${trip.isCompleted ? 'completed' : 'planned'}`}>
                        {trip.isCompleted ? 'Completed' : 'Planned'}
                    </span>
                </div>

                <div className="trip-details-cover">
                    <img src={cover} alt={trip.name} onError={(e) => { e.currentTarget.src = PLACE_IMG_FALLBACK; }} />
                </div>

                <div className="trip-details-content">
                    <div className="trip-info-section">
                        <h2>Trip Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Start Date:</span>
                                <span className="info-value">{fmtDate(trip.startDate)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">End Date:</span>
                                <span className="info-value">{fmtDate(trip.endDate)}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Duration:</span>
                                <span className="info-value">{days} {days > 1 ? 'days' : 'day'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Total Places:</span>
                                <span className="info-value">{trip.places?.length || 0}</span>
                            </div>
                            {totalTravel !== '0m' && (
                                <div className="info-item">
                                    <span className="info-label">Total Travel Time:</span>
                                    <span className="info-value">{totalTravel}</span>
                                </div>
                            )}
                            {totalFees > 0 && (
                                <div className="info-item">
                                    <span className="info-label">Total Entrance Fees:</span>
                                    <span className="info-value">NPR {totalFees}</span>
                                </div>
                            )}
                            {trip.budget?.total && (
                                <div className="info-item">
                                    <span className="info-label">Budget:</span>
                                    <span className="info-value">{trip.budget.currency} {trip.budget.total}</span>
                                </div>
                            )}
                        </div>
                        {trip.description && (
                            <div className="description-section">
                                <h3>Description</h3>
                                <p>{trip.description}</p>
                            </div>
                        )}
                    </div>

                    {trip.itinerary && trip.itinerary.length > 0 && (
                        <div className="itinerary-section">
                            <h2>Itinerary</h2>
                            {trip.itinerary.map((day, dayIdx) => (
                                <div key={dayIdx} className="day-card">
                                    <h3 className="day-title">Day {day.dayNumber || dayIdx + 1}</h3>
                                    {day.date && (
                                        <p className="day-date">{fmtDate(day.date)}</p>
                                    )}
                                    <div className="day-items">
                                        {day.items && day.items.map((item, itemIdx) => {
                                            const place = trip.places?.find(p => 
                                                (typeof p === 'string' ? p : p._id) === item.place
                                            );
                                            return (
                                                <div key={itemIdx} className="itinerary-item">
                                                    <div className="item-number">{itemIdx + 1}</div>
                                                    <div className="item-content">
                                                        {place && (
                                                            <div className="item-header">
                                                                <img 
                                                                    src={getEntityImage(place)} 
                                                                    alt={place.name || 'Place'} 
                                                                    className="item-image"
                                                                    onError={(e) => { e.currentTarget.src = PLACE_IMG_FALLBACK; }}
                                                                />
                                                                <div className="item-info">
                                                                    <h4>{place.name || 'Unnamed Place'}</h4>
                                                                    {place.city && <p className="item-location">{place.city}</p>}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="item-details">
                                                            {item.startTime && (
                                                                <span className="detail-badge">🕒 {item.startTime}</span>
                                                            )}
                                                            {item.duration && (
                                                                <span className="detail-badge">⏱️ {fmtMins(item.duration)}</span>
                                                            )}
                                                            {item.travelTime && (
                                                                <span className="detail-badge">🚗 Travel: {fmtMins(item.travelTime)}</span>
                                                            )}
                                                            {item.entranceFee > 0 && (
                                                                <span className="detail-badge">💰 NPR {item.entranceFee}</span>
                                                            )}
                                                        </div>
                                                        {item.notes && (
                                                            <p className="item-notes">{item.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {trip.places && trip.places.length > 0 && !trip.itinerary && (
                        <div className="places-section">
                            <h2>Places to Visit</h2>
                            <div className="places-grid">
                                {trip.places.map((place, idx) => (
                                    <div key={idx} className="place-card">
                                        <img 
                                            src={getEntityImage(place)} 
                                            alt={place.name || 'Place'} 
                                            className="place-image"
                                            onError={(e) => { e.currentTarget.src = PLACE_IMG_FALLBACK; }}
                                        />
                                        <div className="place-info">
                                            <h4>{place.name || 'Unnamed Place'}</h4>
                                            {place.city && <p className="place-location">{place.city}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="actions-section">
                        <button className="edit-btn" onClick={() => navigate(`/trips`, { state: { editTrip: trip } })}>
                            Edit Trip
                        </button>
                        <button className="back-btn" onClick={() => navigate("/trips")}>
                            Back to All Trips
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
