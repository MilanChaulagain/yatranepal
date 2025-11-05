import React, { useEffect, useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import useFetch from "../../hooks/useFetch";
import { Link, useNavigate } from "react-router-dom";
import "./createTrip.scss";

// Shared image resolver (mirrors Planner)
const PLACE_IMG_FALLBACK = "/images/1.jpg";
function getEntityImage(entity, fallback = PLACE_IMG_FALLBACK) {
  if (!entity) return fallback;
  const tryVal = (v) => (typeof v === "string" ? v : v?.url || v?.src || v?.secure_url);
  if (Array.isArray(entity?.photos) && entity.photos.length) {
    const v = tryVal(entity.photos[0]);
    if (v) return v;
  }
  if (Array.isArray(entity?.images) && entity.images.length) {
    const v = tryVal(entity.images[0]);
    if (v) return v;
  }
  const single = tryVal(entity?.photo || entity?.image || entity?.img || entity?.thumbnail);
  return single || fallback;
}

const DemoTripCard = ({ trip, onSelect }) => (
  <div className="demoTripCard">
    <div className="demoTripHeader">
      <h3>{trip.title}</h3>
      <span className="badge">{trip.days} days</span>
    </div>
    <p className="demoTripDesc">{trip.description}</p>
    <div className="demoTripThumbs">
      {trip.places.slice(0, 6).map((p) => (
        <img
          key={p._id}
          className="demoTripThumb"
          src={getEntityImage(p)}
          alt={p.name}
          onError={(e) => {
            e.currentTarget.src = PLACE_IMG_FALLBACK;
          }}
        />
      ))}
      {trip.places.length > 6 && (
        <span className="demoTripMore">+{trip.places.length - 6}</span>
      )}
    </div>
    <div className="demoTripMeta">
      <span>Places: {trip.places.map(p=>p.name).join(", ")}</span>
      <span>Total est. cost: NPR {trip.estimate.toLocaleString()}</span>
    </div>
    <button className="button-17" onClick={() => onSelect(trip)}>Use this plan</button>
  </div>
);

export default function CreateTrip() {
  const navigate = useNavigate();
  const { data: placesRes = [] } = useFetch("/api/place");
  const { data: hotelsRes = [] } = useFetch("/api/hotels");
  const { data: exchangesRes = [] } = useFetch("/api/money-exchange");
  const [demoTrips, setDemoTrips] = useState([]);

  useEffect(() => {
    const places = Array.isArray(placesRes?.data) ? placesRes.data : Array.isArray(placesRes) ? placesRes : [];
    const hotels = Array.isArray(hotelsRes?.data) ? hotelsRes.data : Array.isArray(hotelsRes) ? hotelsRes : [];
    const exchanges = Array.isArray(exchangesRes?.data) ? exchangesRes.data : Array.isArray(exchangesRes) ? exchangesRes : [];
    if (!Array.isArray(places) || places.length === 0) return;
    // Build a few demo trips from available data
    const topPlaces = places.slice(0, 8);
    const trip1 = {
      key: "ktm-essentials",
      title: "Kathmandu Essentials",
      description: "A compact tour of Kathmandu's cultural highlights on a budget.",
      days: 2,
      places: topPlaces.slice(0, 4),
      estimate: estimateCost(topPlaces.slice(0, 4), hotels, exchanges),
    };
    const trip2 = {
      key: "valley-highlights",
      title: "Kathmandu Valley Highlights",
      description: "Best of Kathmandu, Patan, and Bhaktapur with local stays.",
      days: 3,
      places: topPlaces.slice(0, 6),
      estimate: estimateCost(topPlaces.slice(0, 6), hotels, exchanges),
    };
    const trip3 = {
      key: "culture-food",
      title: "Culture & Food Trail",
      description: "Mix of temples, heritage squares, and foodie stops.",
      days: 2,
      places: topPlaces.slice(2, 6),
      estimate: estimateCost(topPlaces.slice(2, 6), hotels, exchanges),
    };
    setDemoTrips([trip1, trip2, trip3]);
  }, [placesRes, hotelsRes, exchangesRes]);

  const handleSelectPlan = (trip) => {
    // Navigate to planner with preselected places
    const locked = trip.places.map(p => p._id);
    navigate("/trips/plan", { state: { lockedPlaceIds: locked, suggestedTitle: trip.title } });
  };

  return (
    <div>
      <Navbar />
      <div className="container createTrip">
        <h1 className="title">Start a Trip</h1>
        <p className="subtitle">
          Pick a ready-made plan built from real places and hotels, or create your own from scratch.
        </p>

        <section className="demoGrid">
          {demoTrips.map((t) => (
            <DemoTripCard key={t.key} trip={t} onSelect={handleSelectPlan} />
          ))}
        </section>

        <div className="actions">
          <button className="button-17" onClick={() => navigate("/trips/plan")}>Create my own trip</button>
          <Link to="/trips" className="button-17" style={{ textDecoration: "none", lineHeight: "36px" }}>View my trips</Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function estimateCost(places, hotels, exchanges) {
  const entrance = places.reduce((s, p) => s + (p.entranceFee || 0), 0);
  const hotel = hotels?.length ? hotels[0].cheapestPrice || 0 : 0;
  const buffer = 1000; // food/transport buffer
  return entrance + hotel + buffer;
}
