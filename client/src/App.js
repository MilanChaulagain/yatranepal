import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoadingBar from 'react-top-loading-bar';
import { LoadingProvider, useLoading } from "./context/LoadingContext";
import { useLoadingRoutes } from "./hooks/useLoadingRoutes";

import Home from "./pages/home/Home";
import HotelDetails from "./pages/hotelDetails/HotelDetails";
import Hotel from "./pages/hotel/Hotel";
import List from "./pages/list/List";
import LoginPage from "./pages/login/Login";
import RegisterPage from "./pages/Register/register";
import Profile from "./pages/profile/profile";
import Stays from "./pages/stays/stays";
import Flights from "./pages/flights/flights";
import MoneyExchange from "./pages/money-exchange/money-exchange";
import TouristGuide from "./pages/Tourist/TouristGuide/touristguide";
import TouristGuideForm from "./pages/Tourist/Touristguider/Touristguider";
import UserDashboard from "./pages/Tourist/Touristuser/touristuser";
import ChatPage from "./pages/chat/chat";
import TouristGuideDashboard from "./pages/Tourist/Touristguidedashboard/TouristGuidedashboard";
import Places from "./pages/place/place";
import TravellersChoice from "./pages/Discover/TravellerChoise/TravellersChoice";
import TravelStories from "./pages/Discover/TravellersStories/TravellersStories";
import ShareStory from "./pages/Discover/ShareStory/ShareStory";
import Trips from "./pages/Trips/trips";
import TripDetails from "./pages/Trips/TripDetails";
import CreateTrip from "./pages/Trips/CreateTrip";
import WriteReview from "./pages/ReviewAll/writereview/writereview";
import AllReviewsPage from "./pages/ReviewAll/viewreview/viewreview";
import Createblog from "./pages/blog/Createblog/createblog";
import Viewblog from "./pages/blog/Viewblog/viewblog";
import FullBlog from "./pages/blog/FullBlog/fullblog";
import ChadParbaList from "./pages/Events/allevents/allevents";
import ChadParbaDetail from "./pages/Events/viewbyid/viewbyid";
import Bookings from "./pages/booked/booked";
import PlaceDetails from "./pages/place/placedetails";
import ResetPassword from "./pages/ForgotPassword/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import NepaliCalendar from "./pages/calender/calender";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import PaymentFailure from "./pages/Payment/PaymentFailure";
import Planner from "./pages/Trips/Planner";
import { Toaster } from "react-hot-toast";
import RequireAuth from "./components/auth/RequireAuth";

const AppContent = () => {
  const { progress } = useLoading();
  useLoadingRoutes(); // Add this line to handle route changes

  return (
    <div>
      <LoadingBar
        color='#2998ff'
        progress={progress}
        height={3}
        shadow={true}
        className="loading-bar"
        loaderSpeed={300}
        transitionTime={400}
        waitingTime={500}
      />
      <Toaster 
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        top: 80, // Position below navbar (navbar height + some spacing)
        left: 20,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
        },
      }}
    />
    <Routes>
        {/* Public and user-facing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/stays" element={<Stays />} />
        <Route path="/stays/:id" element={<HotelDetails />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/money-exchange" element={<MoneyExchange />} />
        <Route path="/hotels" element={<List />} />
        <Route path="/hotels/:id" element={<Hotel />} />
        <Route path="/touristguide" element={<TouristGuide />} />
        <Route path="/create-tourist-guide" element={<TouristGuideForm />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/touristguide-dashboard" element={<TouristGuideDashboard />} />
        <Route path="/places" element={<Places />} />
        <Route path="/calendar" element={<NepaliCalendar />} />
        <Route path="/placedetails/:id" element={<PlaceDetails />} />
        <Route path="/travellers-choice" element={<TravellersChoice />} />
        <Route path="/travel-stories" element={<TravelStories />} />
        <Route path="/share-story" element={<RequireAuth><ShareStory /></RequireAuth>} />
        <Route path="/trips" element={<RequireAuth><Trips /></RequireAuth>} />
        <Route path="/trips/:id" element={<RequireAuth><TripDetails /></RequireAuth>} />
        <Route path="/trips/create" element={<RequireAuth><CreateTrip /></RequireAuth>} />
        <Route path="/trips/plan" element={<RequireAuth><Planner /></RequireAuth>} />
        <Route path="/write-review" element={<WriteReview />} />
        <Route path="/reviews" element={<AllReviewsPage />} />
        <Route path="/write-blog" element={<Createblog />} />
        <Route path="/blog" element={<Viewblog />} />
        <Route path="/blog/:blogId" element={<FullBlog />} />
        <Route path="/events" element={<ChadParbaList />} />
        <Route path="/events/:id" element={<ChadParbaDetail />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failure" element={<PaymentFailure />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </BrowserRouter>
  );
}

export default App;