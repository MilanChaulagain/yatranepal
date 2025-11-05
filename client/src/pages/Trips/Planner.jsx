import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import useFetch from "../../hooks/useFetch";
import api from "../../utils/api";
import "./planner.scss";
import toast from "react-hot-toast";

// Shared image resolver for places/hotels
const PLACE_IMG_FALLBACK = "/images/1.jpg";
function getEntityImage(entity, fallback = PLACE_IMG_FALLBACK) {
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
}

export default function Planner() {
  const location = useLocation();
  const state = location.state || {};
  const preLocked = state.lockedPlaceIds || [];
  const editingTripId = state.editingTripId;
  const existingTrip = state.existingTrip;

  const { data: placesRes = [] } = useFetch("/api/place");
  const { data: hotelsRes = [] } = useFetch("/api/hotels");
  const places = useMemo(() => (Array.isArray(placesRes?.data) ? placesRes.data : Array.isArray(placesRes) ? placesRes : []), [placesRes]);
  const hotels = useMemo(() => (Array.isArray(hotelsRes?.data) ? hotelsRes.data : Array.isArray(hotelsRes) ? hotelsRes : []), [hotelsRes]);

  const [selectedPlaceIds, setSelectedPlaceIds] = useState(new Set(preLocked));
  const [tripName, setTripName] = useState(existingTrip?.name || state.suggestedTitle || "My Trip");
  const [budget, setBudget] = useState(existingTrip?.budget?.total || 30000);
  const [pace, setPace] = useState(existingTrip?.preferences?.pace || "standard");
  const [interests, setInterests] = useState(existingTrip?.preferences?.interests || []);
  const [startCoords, setStartCoords] = useState([85.3240, 27.7172]); // [lng, lat] Kathmandu default
  const [useMyLocation, setUseMyLocation] = useState(false);
  const [startDate, setStartDate] = useState(existingTrip?.startDate ? existingTrip.startDate.split('T')[0] : isoToday());
  const [endDate, setEndDate] = useState(existingTrip?.endDate ? existingTrip.endDate.split('T')[0] : isoToday());
  const [filter, setFilter] = useState("");
  const [planning, setPlanning] = useState(false);
  const [trip, setTrip] = useState(existingTrip?.itinerary ? existingTrip : null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!useMyLocation) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setStartCoords([longitude, latitude]);
      },
      () => setUseMyLocation(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [useMyLocation]);

  const filteredPlaces = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return places;
    return places.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  }, [filter, places]);

  const togglePlace = (id) => {
    setSelectedPlaceIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlanning(true);
    setError("");
    setIsSaved(false);
    try {
      const body = {
        name: tripName,
        startLocation: { type: "Point", coordinates: startCoords },
        startDate,
        endDate,
        budget: { total: Number(budget) || 0, currency: "NPR" },
        preferences: { pace, interests, dailyStartHour: 9, dailyEndHour: 18 },
        lockedPlaceIds: Array.from(selectedPlaceIds),
      };
      const res = await api.post("/trips/plan", body);
      setTrip(res.data?.data || res.data);
    } catch (err) {
      console.error("Plan failed", err);
      setError(err.response?.data?.message || err.message || "Failed to plan trip");
    } finally {
      setPlanning(false);
    }
  };

  const itineraryCoords = useMemo(() => {
    if (!trip?.itinerary) return [];
    const byId = new Map(places.map(p => [p._id, p]));
    return trip.itinerary.map((day) =>
      day.items
        .map((it) => byId.get(it.place)?.location?.coordinates)
        .filter(Boolean)
    );
  }, [trip, places]);

  const handleSave = async () => {
    if (!trip) return;
    setSaving(true);
    setError("");
    try {
      const payload = { ...trip };
      delete payload.unsaved;
      
      let res;
      if (editingTripId) {
        // Update existing trip
        res = await api.put(`/trips/${editingTripId}`, payload);
        toast.success("Trip updated");
      } else {
        // Create new trip
        res = await api.post("/trips", payload);
        toast.success("Trip saved");
      }
      
      setTrip(res.data?.data || res.data);
      setIsSaved(true);
    } catch (err) {
      console.error("Save failed", err);
      setError(err.response?.data?.message || err.message || "Failed to save trip");
    } finally {
      setSaving(false);
    }
  };

  const nearbyHotelsByDay = useMemo(() => {
    if (!trip?.itinerary || !hotels?.length) return [];
    // if hotels lack coordinates, we will match by city
    const byId = new Map(places.map(p => [p._id, p]));
    return trip.itinerary.map((day) => {
      const cities = new Set(day.items.map(it => byId.get(it.place)?.city).filter(Boolean));
      const list = hotels.filter(h => !cities.size || cities.has(h.city)).slice(0, 5);
      return list;
    });
  }, [trip, hotels, places]);

  const interestOptions = [
    "Cultural","Natural","Historical","Adventure","Religious","Food Destinations","Photography"
  ];

  return (
    <div>
      <Navbar />
  <div className={`container planner ${planning ? 'is-planning' : ''}`}>
        <h1 className="planner-title">{editingTripId ? "Edit Your Trip" : "Plan Your Trip"}</h1>
        {state.suggestedTitle && !editingTripId && <p style={{ color: "#666" }}>Suggested plan: {state.suggestedTitle}</p>}

        <form onSubmit={handleSubmit} className="planner-form">
          <div className="planner-form-top">
            <div>
              <label>Trip name</label>
              <input value={tripName} onChange={(e)=>setTripName(e.target.value)} className="input" />
            </div>
            <div>
              <label>Start date</label>
              <input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="input" />
            </div>
            <div>
              <label>End date</label>
              <input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="input" />
            </div>
            <div>
              <label>Budget (NPR)</label>
              <input type="number" value={budget} onChange={(e)=>setBudget(e.target.value)} className="input" />
            </div>
          </div>

          <div>
            <label>Start location</label>
            <div className="row-gap">
              <input type="number" step="0.000001" value={startCoords[1]} onChange={(e)=>setStartCoords([startCoords[0], parseFloat(e.target.value)||0])} className="input" placeholder="Latitude" />
              <input type="number" step="0.000001" value={startCoords[0]} onChange={(e)=>setStartCoords([parseFloat(e.target.value)||0, startCoords[1]])} className="input" placeholder="Longitude" />
            </div>
            <label className="checkbox-inline">
              <input type="checkbox" checked={useMyLocation} onChange={(e)=>setUseMyLocation(e.target.checked)} />
              Use my current location
            </label>
          </div>

          <div>
            <label>Pace</label>
            <select value={pace} onChange={(e)=>setPace(e.target.value)} className="input">
              <option value="relaxed">Relaxed</option>
              <option value="standard">Standard</option>
              <option value="packed">Packed</option>
            </select>
            <div className="mt-8">
              <label>Interests</label>
              <div className="chips">
                {interestOptions.map(opt => (
                  <label key={opt} className="chip">
                    <input type="checkbox" checked={interests.includes(opt)} onChange={(e)=>{
                      setInterests(prev => e.target.checked ? [...prev, opt] : prev.filter(x=>x!==opt));
                    }} />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="place-select">
            <label>Select places to visit</label>
            <input className="input" placeholder="Search places by name/city/address" value={filter} onChange={(e)=>setFilter(e.target.value)} />
            <div className="place-grid">
              {filteredPlaces.map(p => (
                <label key={p._id} className={`place-card ${selectedPlaceIds.has(p._id) ? 'selected' : ''}`}>
                  <input type="checkbox" checked={selectedPlaceIds.has(p._id)} onChange={()=>togglePlace(p._id)} />
                  <img className="place-thumb" src={getEntityImage(p)} alt={p.name} onError={(e)=>{ e.currentTarget.src = PLACE_IMG_FALLBACK; }} />
                  <span>
                    <div className="place-name">{p.name}</div>
                    <div className="place-sub">{p.city} • {p.address}</div>
                    {typeof p.entranceFee === 'number' && <div className="place-fee">Fee: NPR {p.entranceFee}</div>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="actions">
            <button type="submit" className="button-17" disabled={planning}>
              {planning ? "Planning..." : editingTripId ? "Update Trip" : "Create Trip"}
            </button>
          </div>
        </form>

        {trip && (
          <div className="itinerary">
            <h2 className="itinerary-title">Itinerary</h2>
            <ItineraryView trip={trip} places={places} hotelsByDay={nearbyHotelsByDay} />
            <div className="itinerary-map">
              <ItineraryMap polylines={itineraryCoords} markers={markersFromPolylines(itineraryCoords)} />
            </div>
            <div className="actions actions-between" style={{ marginTop: 16 }}>
              <button className="button-17" onClick={handleSave} disabled={saving || isSaved}>
                {saving ? "Saving..." : isSaved ? (editingTripId ? "Trip updated" : "Trip saved") : (editingTripId ? "Update Trip" : "Save Trip")}
              </button>
              {isSaved && (
                <button className="button-17" onClick={() => setShowDetails(true)} style={{ marginLeft: 'auto' }}>
                  View details
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
      {showDetails && trip && (
        <DetailsModal
          trip={trip}
          places={places}
          hotelsByDay={nearbyHotelsByDay}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}

function isoToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function ItineraryView({ trip, places, hotelsByDay = [] }) {
  const byId = useMemo(() => new Map(places.map(p => [p._id, p])), [places]);
  return (
    <div>
      {trip.itinerary?.map((day, idx) => (
        <div key={idx} className="itinerary-day">
          <div className="itinerary-day-header">Day {idx + 1}</div>
          <div className="itinerary-day-meta">Travel: {day.totalTravelMinutes} mins • Fees: NPR {day.totalEntranceFees}</div>
          <ol className="itinerary-list">
            {day.items.map((it, j) => {
              const p = byId.get(it.place);
              return (
                <li key={j} className="itinerary-item">
                  <img className="itinerary-thumb" src={getEntityImage(p)} alt={p?.name || 'Place'} loading="lazy" onError={(e)=>{e.currentTarget.src='/images/1.jpg'}} />
                  <div className="itinerary-info">
                    <div className="itinerary-title-row">
                      <span className="itinerary-place-name">{p?.name || 'Place'}</span>
                      <span className="itinerary-time">{it.startTime} – {it.endTime}</span>
                    </div>
                    <div className="itinerary-sub">{p?.city} • {p?.address}</div>
                    <div className="itinerary-sub">{it.distanceKmFromPrev} km / {it.travelMinutesFromPrev} mins</div>
                  </div>
                </li>
              );
            })}
          </ol>
          {hotelsByDay[idx]?.length ? (
            <div className="nearby-hotels">
              <div className="nearby-title">Nearby hotels</div>
              <div className="nearby-list">
                {hotelsByDay[idx].map((h, k) => (
                  <div key={k} className="nearby-card">
                    <img className="nearby-thumb" src={getEntityImage(h)} alt={h.name} loading="lazy" onError={(e)=>{e.currentTarget.src='/images/1.jpg'}} />
                    <div className="nearby-info">
                      <div className="nearby-name">{h.name}</div>
                      <div className="nearby-sub">{h.city} • {h.address}</div>
                      {typeof h.cheapestPrice === 'number' && (<div className="nearby-price">NPR {h.cheapestPrice}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DetailsModal({ trip, places, hotelsByDay, onClose }) {
  const byId = useMemo(() => new Map(places.map(p => [p._id, p])), [places]);
  const totalDays = trip?.itinerary?.length || 0;
  const totalPlaces = trip?.itinerary?.reduce((s, d) => s + (d.items?.length || 0), 0) || 0;
  return (
    <div className="details-modal-overlay" role="dialog" aria-modal="true">
      <div className="details-modal">
        <div className="details-modal-header">
          <h3>{trip?.name || "Your Trip"}</h3>
          <button className="details-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="details-summary">
          <span className="chip">{totalDays} days</span>
          <span className="chip">{totalPlaces} places</span>
          {trip?.budget?.total ? (<span className="chip">Budget: NPR {trip.budget.total}</span>) : null}
          {trip?.startDate && trip?.endDate ? (
            <span className="chip">{trip.startDate} → {trip.endDate}</span>
          ) : null}
        </div>
        <div className="details-content">
          {trip?.itinerary?.map((day, idx) => (
            <div key={idx} className="details-day">
              <div className="details-day-header">Day {idx + 1}</div>
              <div className="details-roadmap">
                {day.items.map((it, j) => {
                  const p = byId.get(it.place);
                  const isLast = j === day.items.length - 1;
                  return (
                    <div key={`rm-${j}`} className="roadmap-row">
                      <div className="roadmap-left">
                        <div className="roadmap-marker">{j + 1}</div>
                        {!isLast && <div className="roadmap-connector" />}
                      </div>
                      <div className="roadmap-content">
                        <div className="roadmap-top">
                          <span className="roadmap-name">{p?.name || 'Place'}</span>
                          <span className="roadmap-time">{it.startTime} – {it.endTime}</span>
                        </div>
                        <div className="roadmap-sub">{p?.city} • {p?.address}</div>
                        <div className="roadmap-sub">{it.distanceKmFromPrev} km • {it.travelMinutesFromPrev} mins</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <ol className="details-list">
                {day.items.map((it, j) => {
                  const p = byId.get(it.place);
                  return (
                    <li key={j} className="details-item">
                      <img className="details-thumb" src={getEntityImage(p)} alt={p?.name || 'Place'} loading="lazy" onError={(e)=>{e.currentTarget.src='/images/1.jpg'}} />
                      <div className="details-info">
                        <div className="details-row">
                          <span className="details-name">{p?.name || 'Place'}</span>
                          <span className="details-time">{it.startTime} – {it.endTime}</span>
                        </div>
                        <div className="details-sub">{p?.city} • {p?.address}</div>
                        <div className="details-sub">{it.distanceKmFromPrev} km / {it.travelMinutesFromPrev} mins</div>
                      </div>
                    </li>
                  );
                })}
              </ol>
              {hotelsByDay?.[idx]?.length ? (
                <div className="details-hotels">
                  <div className="details-hotels-title">Recommended nearby hotels</div>
                  <div className="details-hotels-list">
                    {hotelsByDay[idx].map((h, k) => (
                      <div key={k} className="details-hotel-card">
                        <img className="details-hotel-thumb" src={getEntityImage(h)} alt={h.name} loading="lazy" onError={(e)=>{e.currentTarget.src='/images/1.jpg'}} />
                        <div className="details-hotel-info">
                          <div className="details-hotel-name">{h.name}</div>
                          <div className="details-hotel-sub">{h.city} • {h.address}</div>
                          {typeof h.cheapestPrice === 'number' && (<div className="details-hotel-price">NPR {h.cheapestPrice}</div>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div className="details-modal-actions">
          <button className="button-17" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ItineraryMap({ polylines = [], markers = [] }) {
  // Hooks must be declared before any early returns
  const [routeData, setRouteData] = useState([]);

  // Lazy require Leaflet only if available, otherwise show a hint.
  let LeafletComponents = null;
  try {
    // eslint-disable-next-line global-require
    const RL = require('react-leaflet');
    // eslint-disable-next-line global-require
    const L = require('leaflet');
    LeafletComponents = { RL, L };
  } catch (e) {}

  useEffect(() => {
    let cancelled = false;
    async function fetchRoutes() {
      const results = [];
      for (const dayCoords of polylines) {
        if (!Array.isArray(dayCoords) || dayCoords.length < 2) {
          results.push(null);
          continue;
        }
        const pairs = dayCoords.map(([lng, lat]) => `${lng},${lat}`).join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${pairs}?overview=full&geometries=geojson&steps=true`;
        try {
          const resp = await fetch(url);
          const json = await resp.json();
          const route = json?.routes?.[0];
          if (!route) { results.push(null); continue; }
          const latlngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          const legs = (route.legs || []).map((leg) => ({ distance: leg.distance, duration: leg.duration }));
          results.push({ latlngs, legs });
        } catch (e) {
          results.push(null);
        }
      }
      if (!cancelled) setRouteData(results);
    }
    fetchRoutes();
    return () => { cancelled = true; };
  }, [polylines]);

  if (!LeafletComponents) {
    return (
      <div style={{ border: '1px dashed #ccc', borderRadius: 8, padding: 12 }}>
        Map preview requires leaflet. Install with:
        <pre style={{ marginTop: 8 }}>
{`cd client
npm install leaflet react-leaflet`}
        </pre>
      </div>
    );
  }

  const { RL, L } = LeafletComponents;
  const { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } = RL;

  const center = markers[0]?.position ? [markers[0].position[1], markers[0].position[0]] : [27.7172, 85.3240];

  const numberedIcon = (n) =>
    L.divIcon({
      className: 'numbered-marker',
      html: `<div style="background:#2563eb;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)">${n}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

  // Flatten original place coords (for numbering markers)
  const flatCoords = polylines.flat();

  return (
    <MapContainer center={center} zoom={12} style={{ height: 420, width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {routeData.map((r, i) => (
        r ? (
          <Polyline key={`route-${i}`} positions={r.latlngs} pathOptions={{ color: i % 2 ? '#2d5c7f' : '#ff6b6b', weight: 4 }} />
        ) : (
          <Polyline key={`fallback-${i}`} positions={polylines[i].map(([lng, lat]) => [lat, lng])} pathOptions={{ color: i % 2 ? '#2d5c7f' : '#ff6b6b', dashArray: '6 6', weight: 3 }} />
        )
      ))}

      {polylines.map((coords, dayIdx) => (
        coords.slice(1).map((b, segIdx) => {
          const a = coords[segIdx];
          const leg = routeData[dayIdx]?.legs?.[segIdx];
          const text = leg ? `${(leg.distance/1000).toFixed(1)} km • ${Math.round((leg.duration||0)/60)} mins` : '';
          return (
            <Polyline key={`seg-${dayIdx}-${segIdx}`} positions={[[a[1], a[0]], [b[1], b[0]]]} pathOptions={{ color: 'transparent', weight: 8 }}>
              {text && (
                <Tooltip permanent direction="center" opacity={0.9} offset={[0, 0]}>
                  {text}
                </Tooltip>
              )}
            </Polyline>
          );
        })
      ))}

      {flatCoords.map((coord, i) => (
        <Marker key={i} position={[coord[1], coord[0]]} icon={numberedIcon(i + 1)}>
          <Popup>Stop {i + 1}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function markersFromPolylines(polylines) {
  const markers = [];
  let seq = 1;
  for (const line of polylines) {
    for (const coord of line) {
      markers.push({ position: coord, seq, label: `Stop ${seq}` });
      seq += 1;
    }
  }
  return markers;
}
