import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import Navbar from "../../components/navbar/Navbar";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import "./trips.css"; // Import the CSS

export default function Trips() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showCreate, setShowCreate] = useState(false);
    const [newTrip, setNewTrip] = useState({ name: "", description: "", startDate: "", endDate: "" });
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("created-desc");
    const [pendingDeleteId, setPendingDeleteId] = useState(null);
    const [pendingDeleteName, setPendingDeleteName] = useState("");
    const [deleting, setDeleting] = useState(false);

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

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/trips/user");
            setTrips(res.data.data || []);
        } catch (err) {
            setError("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTrip = async (e) => {
        e.preventDefault();
        try {
            await api.post("/trips", newTrip);
            setShowCreate(false);
            setNewTrip({ name: "", description: "", startDate: "", endDate: "" });
            fetchTrips();
            toast.success("Trip created");
        } catch (err) {
            setError("Failed to create trip");
            toast.error("Failed to create trip");
        }
    };

    const handleEdit = (trip) => {
        const locked = (trip.places || []).map(p => (typeof p === 'string' ? p : p._id));
        navigate("/trips/plan", { 
            state: { 
                lockedPlaceIds: locked, 
                suggestedTitle: trip.name,
                editingTripId: trip._id,
                existingTrip: {
                    name: trip.name,
                    description: trip.description,
                    startDate: trip.startDate,
                    endDate: trip.endDate,
                    budget: trip.budget,
                    preferences: trip.preferences,
                    itinerary: trip.itinerary
                }
            } 
        });
    };

    const handleComplete = async (tripId, completed) => {
        try {
            await api.put(`/trips/${tripId}`, { isCompleted: completed });
            fetchTrips();
            toast.success(completed ? "Marked as completed" : "Marked as incomplete");
        } catch (e) {
            setError("Failed to update trip status");
            toast.error("Failed to update trip status");
        }
    };

    const handleDelete = (trip) => {
        setPendingDeleteId(trip._id);
        setPendingDeleteName(trip.name || "this trip");
    };

    const confirmDelete = async () => {
        if (!pendingDeleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/trips/${pendingDeleteId}`);
            setPendingDeleteId(null);
            setPendingDeleteName("");
            fetchTrips();
            toast.success("Trip deleted");
        } catch (e) {
            toast.error("Failed to delete trip");
        } finally {
            setDeleting(false);
        }
    };

    const cancelDelete = () => {
        if (deleting) return;
        setPendingDeleteId(null);
        setPendingDeleteName("");
    };

    const filtered = trips.filter(t => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        const text = [t.name, t.description, t.places?.map(p=>p?.name).join(" ")].filter(Boolean).join(" ").toLowerCase();
        return text.includes(q);
    });

    const sorted = [...filtered].sort((a,b)=>{
        switch (sortBy) {
            case "start-asc":
                return new Date(a.startDate||0) - new Date(b.startDate||0);
            case "start-desc":
                return new Date(b.startDate||0) - new Date(a.startDate||0);
            case "created-asc":
                return new Date(a.createdAt||0) - new Date(b.createdAt||0);
            case "created-desc":
            default:
                return new Date(b.createdAt||0) - new Date(a.createdAt||0);
        }
    });

    const fmtMins = (mins) => {
        if (!mins) return "0m";
        const h = Math.floor(mins/60);
        const m = Math.round(mins%60);
        return h ? `${h}h ${m}m` : `${m}m`;
    };

    const dayCount = (t) => {
        if (t?.totals?.days) return t.totals.days;
        if (t?.startDate && t?.endDate) {
            const d = Math.max(1, Math.ceil((new Date(t.endDate) - new Date(t.startDate)) / (1000*60*60*24)) + 1);
            return d;
        }
        return t?.itinerary?.length || 0;
    };

    return (
        <div>
            <Navbar />
            <Header />
            <div className="trips-container">
                <h1 className="trips-heading">My Trips</h1>
                <div className="toolbar">
                    <div className="search-wrap">
                        <input
                            className="search-input"
                            placeholder="Search by name, place, or description..."
                            value={query}
                            onChange={(e)=>setQuery(e.target.value)}
                        />
                    </div>
                    <div className="controls">
                        <select className="sort-select" value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
                            <option value="created-desc">Newest first</option>
                            <option value="created-asc">Oldest first</option>
                            <option value="start-asc">Start date ↑</option>
                            <option value="start-desc">Start date ↓</option>
                        </select>
                        <button className="create-trip-btn" onClick={() => navigate('/trips/plan')}>Create New Trip</button>
                    </div>
                </div>
                {showCreate && (
                    <form className="create-trip-form" onSubmit={handleCreateTrip}>
                        <input type="text" placeholder="Trip Name" value={newTrip.name} onChange={e => setNewTrip({ ...newTrip, name: e.target.value })} required />
                        <input type="text" placeholder="Description" value={newTrip.description} onChange={e => setNewTrip({ ...newTrip, description: e.target.value })} />
                        <input type="date" value={newTrip.startDate} onChange={e => setNewTrip({ ...newTrip, startDate: e.target.value })} />
                        <input type="date" value={newTrip.endDate} onChange={e => setNewTrip({ ...newTrip, endDate: e.target.value })} />
                        <button type="submit">Save Trip</button>
                        <button type="button" onClick={() => setShowCreate(false)}>Cancel</button>
                    </form>
                )}
                {loading ? <p>Loading...</p> : error ? <p>{error}</p> : (
                    <div className="trips-grid">
                        {sorted.map(trip => {
                            const cover = getEntityImage(trip.places?.[0]);
                            const days = dayCount(trip);
                            const travel = fmtMins(trip?.totals?.totalTravelMinutes || 0);
                            const fees = trip?.totals?.totalEntranceFees || 0;
                            return (
                                <div key={trip._id} className="trip-card">
                                    <div className="trip-cover-wrap">
                                        <img className="trip-cover" src={cover} alt={trip.name} onError={(e)=>{ e.currentTarget.src = PLACE_IMG_FALLBACK; }} />
                                        <span className={`status-badge over ${trip.isCompleted ? 'completed' : 'planned'}`}>
                                            {trip.isCompleted ? 'Completed' : 'Planned'}
                                        </span>
                                    </div>
                                    <div className="trip-body">
                                        <div className="trip-title-row">
                                            <h2 className="trip-title">{trip.name}</h2>
                                            {trip.createdAt && <span className="trip-date">{new Date(trip.createdAt).toLocaleDateString()}</span>}
                                        </div>
                                        {trip.description && <p className="trip-desc">{trip.description}</p>}
                                        <div className="chip-row">
                                            {trip.startDate && <span className="chip">Start: {new Date(trip.startDate).toLocaleDateString()}</span>}
                                            {trip.endDate && <span className="chip">End: {new Date(trip.endDate).toLocaleDateString()}</span>}
                                            {days ? <span className="chip">{days} {days>1? 'days':'day'}</span> : null}
                                            {trip.places?.length ? <span className="chip">{trip.places.length} places</span> : <span className="chip">No places</span>}
                                            {travel !== '0m' && <span className="chip">Travel: {travel}</span>}
                                            {fees ? <span className="chip">Fees: NPR {fees}</span> : null}
                                        </div>
                                        {trip.places?.length ? (
                                            <div className="place-avatars" title={trip.places.map(p=>p?.name).filter(Boolean).join(', ')}>
                                                {trip.places.slice(0,5).map((p, idx) => (
                                                    <img key={idx} className="avatar" src={getEntityImage(p)} alt={p?.name||'Place'} onError={(e)=>{ e.currentTarget.src = PLACE_IMG_FALLBACK; }} />
                                                ))}
                                                {trip.places.length > 5 && <span className="more">+{trip.places.length-5}</span>}
                                            </div>
                                        ) : null}
                                        <div className="trip-actions">
                                            <button className="view-btn" onClick={() => navigate(`/trips/${trip._id}`)}>View Details</button>
                                            <button className="edit-btn" onClick={() => handleEdit(trip)}>Edit</button>
                                            <button className="complete-btn" onClick={() => handleComplete(trip._id, !trip.isCompleted)}>
                                                {trip.isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDelete(trip)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {pendingDeleteId && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal">
                        <h3>Delete trip?</h3>
                        <p>This will permanently remove "{pendingDeleteName}" and its itinerary.</p>
                        <div className="modal-actions">
                            <button className="danger-btn" onClick={confirmDelete} disabled={deleting}>
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                            <button className="ghost-btn" onClick={cancelDelete} disabled={deleting}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
}