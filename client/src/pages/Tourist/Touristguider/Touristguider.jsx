import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Touristguider.css";
import Navbar from "../../../components/navbar/Navbar";
import Footer from "../../../components/footer/Footer";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8800";

// Add this license number pattern validation
const licenseNumberPattern = /^[A-Z0-9]+$/; // Allows uppercase letters and numbers

const categoryOptions = [
    "Adventure",
    "Cultural",
    "Historical",
    "Wildlife",
    "Religious",
    "Eco-tourism",
    "Trekking",
    "Local Experience",
];

const TouristGuideForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        location: "",
        language: "",
        experience: "",
        contactNumber: "",
        availability: "",
        licenseNumber: "",
        category: [],
        image: "",
    });

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        location: "",
        language: "",
        experience: "",
        contactNumber: "",
        availability: "",
        licenseNumber: "",
        category: "",
        image: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const navigate = useNavigate();

    // Auto-fill user details from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setFormData((prev) => ({
                    ...prev,
                    name: user.username || "",
                    email: user.email || "",
                    contactNumber: user.phone || "",
                    location: user.city ? `${user.city}, ${user.country || ""}` : "",
                }));
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }
    }, []);

    // Validation functions
    const validateName = (name) => {
        if (!name.trim()) {
            return "Name is required";
        }
        if (name.length < 3) {
            return "Name must be at least 3 characters";
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return "Name can only contain letters and spaces";
        }
        return "";
    };

    const validateEmail = (email) => {
        if (!email.trim()) {
            return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address";
        }
        return "";
    };

    const validateLocation = (location) => {
        if (!location.trim()) {
            return "Location is required";
        }
        if (location.length < 3) {
            return "Location must be at least 3 characters";
        }
        return "";
    };

    const validateLanguage = (language) => {
        if (!language.trim()) {
            return "Language is required";
        }
        if (language.length < 2) {
            return "Language must be at least 2 characters";
        }
        if (!/^[a-zA-Z\s,]+$/.test(language)) {
            return "Language can only contain letters, spaces, and commas";
        }
        return "";
    };

    const validateExperience = (experience) => {
        if (!experience) {
            return "Experience is required";
        }
        const expNum = Number(experience);
        if (isNaN(expNum) || expNum < 0) {
            return "Experience must be a positive number";
        }
        if (expNum > 50) {
            return "Experience seems unrealistic (max 50 years)";
        }
        return "";
    };

    const validateContactNumber = (contact) => {
        if (!contact.trim()) {
            return "Contact number is required";
        }
        const cleanPhone = contact.replace(/[\s\-()]/g, '');
        if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
            return "Please enter a valid phone number (10-15 digits)";
        }
        return "";
    };

    const validateAvailability = (availability) => {
        if (!availability.trim()) {
            return "Availability is required";
        }
        if (availability.length < 3) {
            return "Please provide availability details (e.g., Weekdays, Weekends, Full-time)";
        }
        return "";
    };

    const validateLicenseNumber = (license) => {
        if (!license.trim()) {
            return "License number is required";
        }
        if (!licenseNumberPattern.test(license)) {
            return "License number must contain only uppercase letters and numbers";
        }
        if (license.length < 5) {
            return "License number must be at least 5 characters";
        }
        return "";
    };

    const validateCategory = (categories) => {
        if (categories.length === 0) {
            return "Please select at least one category";
        }
        return "";
    };

    const validateImage = (image) => {
        if (!image) {
            return "Profile image is required";
        }
        return "";
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Real-time validation
        let error = "";
        switch (name) {
            case "name":
                error = validateName(value);
                break;
            case "email":
                error = validateEmail(value);
                break;
            case "location":
                error = validateLocation(value);
                break;
            case "language":
                error = validateLanguage(value);
                break;
            case "experience":
                error = validateExperience(value);
                break;
            case "contactNumber":
                error = validateContactNumber(value);
                break;
            case "availability":
                error = validateAvailability(value);
                break;
            case "licenseNumber":
                error = validateLicenseNumber(value);
                break;
            default:
                break;
        }

        setErrors((prev) => ({ ...prev, [name]: error }));
    };

    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        const updated = checked
            ? [...formData.category, value]
            : formData.category.filter((cat) => cat !== value);
        setFormData((prev) => ({ ...prev, category: updated }));
        
        // Validate category selection
        const error = validateCategory(updated);
        setErrors((prev) => ({ ...prev, category: error }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
            // Clear image error when a file is selected
            setErrors((prev) => ({ ...prev, image: "" }));
        }
    };
    const uploadToCloudinary = async () => {
        if (!imageFile) return "";
        
        const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
        const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            throw new Error("Image upload is not configured. Please set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET.");
        }

        const data = new FormData();
        data.append("file", imageFile);
        data.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                data
            );
            return res.data.secure_url;
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            throw new Error("Failed to upload image");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields before submission
        const newErrors = {
            name: validateName(formData.name),
            email: validateEmail(formData.email),
            location: validateLocation(formData.location),
            language: validateLanguage(formData.language),
            experience: validateExperience(formData.experience),
            contactNumber: validateContactNumber(formData.contactNumber),
            availability: validateAvailability(formData.availability),
            licenseNumber: validateLicenseNumber(formData.licenseNumber),
            category: validateCategory(formData.category),
            image: validateImage(imageFile),
        };

        setErrors(newErrors);

        // Check if there are any errors
        const hasErrors = Object.values(newErrors).some(error => error !== "");
        if (hasErrors) {
            toast.error("Please fix all validation errors before submitting");
            // Scroll to top to show errors
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const licenseTrimmed = formData.licenseNumber.trim();

        setUploading(true);

        try {
            let imageUrl = "";
            if (imageFile) {
                imageUrl = await uploadToCloudinary();
            }

            const payload = {
                ...formData,
                experience: Number(formData.experience),
                licenseNumber: licenseTrimmed,
                image: imageUrl,
            };

            await axios.post(`${BASE_URL}/api/touristguide/register`, payload, {
                withCredentials: true,
            });

            toast.success("Tourist guide registered successfully!");
            navigate("/touristguide-dashboard");

            // Reset form
            setFormData({
                name: "",
                email: "",
                location: "",
                language: "",
                experience: "",
                contactNumber: "",
                availability: "",
                licenseNumber: "",
                category: [],
                image: "",
            });
            setImageFile(null);
            setPreview(null);
            setErrors({
                name: "",
                email: "",
                location: "",
                language: "",
                experience: "",
                contactNumber: "",
                availability: "",
                licenseNumber: "",
                category: "",
                image: "",
            });
        } catch (err) {
            console.error(err);
            const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <Navbar />
            <form className="tourist-guide-form" onSubmit={handleSubmit}>
                <h2>Create Tourist Guide Account</h2>

                <div className="tourist-form-row">
                    <div className="tourist-form-group">
                        <label>Upload Profile Image *</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange}
                            className={errors.image ? 'input-error' : ''}
                        />
                        {preview && <img src={preview} alt="Preview" className="image-preview" />}
                        {errors.image && <span className="field-error">{errors.image}</span>}
                    </div>

                    <div className="tourist-form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            onChange={handleInputChange}
                            value={formData.name}
                            className={errors.name ? 'input-error' : ''}
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>

                    <div className="tourist-form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            onChange={handleInputChange}
                            value={formData.email}
                            className={errors.email ? 'input-error' : ''}
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>
                </div>

                <div className="tourist-form-row">
                    <div className="tourist-form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            required
                            onChange={handleInputChange}
                            value={formData.location}
                            className={errors.location ? 'input-error' : ''}
                        />
                        {errors.location && <span className="field-error">{errors.location}</span>}
                    </div>

                    <div className="tourist-form-group">
                        <label>Language</label>
                        <input
                            type="text"
                            name="language"
                            required
                            onChange={handleInputChange}
                            value={formData.language}
                            placeholder="e.g., English, Nepali, Hindi"
                            className={errors.language ? 'input-error' : ''}
                        />
                        {errors.language && <span className="field-error">{errors.language}</span>}
                    </div>

                    <div className="tourist-form-group">
                        <label>Experience (years)</label>
                        <input
                            type="number"
                            name="experience"
                            required
                            min={0}
                            onChange={handleInputChange}
                            value={formData.experience}
                            className={errors.experience ? 'input-error' : ''}
                        />
                        {errors.experience && <span className="field-error">{errors.experience}</span>}
                    </div>
                </div>

                <div className="tourist-form-row">
                    <div className="tourist-form-group">
                        <label>Contact Number</label>
                        <input
                            type="tel"
                            name="contactNumber"
                            required
                            onChange={handleInputChange}
                            value={formData.contactNumber}
                            className={errors.contactNumber ? 'input-error' : ''}
                        />
                        {errors.contactNumber && <span className="field-error">{errors.contactNumber}</span>}
                    </div>

                    <div className="tourist-form-group">
                        <label>Availability</label>
                        <input
                            type="text"
                            name="availability"
                            required
                            onChange={handleInputChange}
                            value={formData.availability}
                            placeholder="e.g., Weekdays, Full-time, Weekends"
                            className={errors.availability ? 'input-error' : ''}
                        />
                        {errors.availability && <span className="field-error">{errors.availability}</span>}
                    </div>

                    <div className="tourist-form-group">
                        <label>License Number</label>
                        <input
                            type="text"
                            name="licenseNumber"
                            required
                            onChange={handleInputChange}
                            value={formData.licenseNumber}
                            placeholder="Uppercase letters and numbers only"
                            className={errors.licenseNumber ? 'input-error' : ''}
                        />
                        {errors.licenseNumber && <span className="field-error">{errors.licenseNumber}</span>}
                    </div>
                </div>

                <div className="tourist-form-row">
                    <div className="tourist-form-group">
                        <label>Select Categories</label>
                        <div className="tourist-category-checkboxes">
                            {categoryOptions.map((cat) => (
                                <label key={cat}>
                                    <input
                                        type="checkbox"
                                        value={cat}
                                        checked={formData.category.includes(cat)}
                                        onChange={handleCategoryChange}
                                    />
                                    {cat}
                                </label>
                            ))}
                        </div>
                        {errors.category && <span className="field-error">{errors.category}</span>}
                    </div>
                </div>

                <button type="submit" disabled={uploading}>
                    {uploading ? "Uploading..." : "Create Guide"}
                </button>
            </form>
            <Footer />
        </>
    );
};

export default TouristGuideForm;
