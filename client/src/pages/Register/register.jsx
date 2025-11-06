"use client"
import React, { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, Upload, User, Mail, MapPin, Phone, Lock } from "lucide-react"
import axios from "axios"

import "./register.css"
import { AuthContext } from "../../context/AuthContext"
import Navbar from "../../components/navbar/Navbar"
import toast from "react-hot-toast"

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        country: "",
        city: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const [errors, setErrors] = useState({
        username: "",
        email: "",
        city: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const [isCheckingPhone, setIsCheckingPhone] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [localError, setLocalError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const { dispatch } = useContext(AuthContext)
    const navigate = useNavigate()

    const countries = ["Nepal", "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan", "Brazil", "India", "China", "Mexico", "Italy", "Spain", "Netherlands", "Sweden", "Norway", "Denmark", "Finland"]

    // Validation functions
    const validateUsername = (username) => {
        if (!username.trim()) {
            return "Username is required"
        }
        if (username.length < 3) {
            return "Username must be at least 3 characters"
        }
        if (username.length > 20) {
            return "Username must be less than 20 characters"
        }
        if (/^\d/.test(username)) {
            return "Username cannot start with a number"
        }
        if (/\s/.test(username)) {
            return "Username cannot contain spaces"
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return "Username can only contain letters, numbers, and underscores"
        }
        return ""
    }

    const validateEmail = (email) => {
        if (!email.trim()) {
            return "Email is required"
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return "Please enter a valid email address"
        }
        return ""
    }

    const validateCity = (city) => {
        if (!city.trim()) {
            return "City is required"
        }
        if (city.length < 2) {
            return "City name must be at least 2 characters"
        }
        if (!/^[a-zA-Z\s]+$/.test(city)) {
            return "City name can only contain letters and spaces"
        }
        return ""
    }

    const validatePhone = (phone) => {
        if (!phone.trim()) {
            return "Phone number is required"
        }
        // Remove spaces, dashes, and parentheses for validation
        const cleanPhone = phone.replace(/[\s\-()]/g, '')
        if (!/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
            return "Please enter a valid phone number (10-15 digits)"
        }
        return ""
    }

    // Check if phone number already exists in database
    const checkPhoneExists = async (phone) => {
        if (!phone || phone.trim() === "") return false
        
        try {
            const response = await axios.get(
                `http://localhost:8800/api/users/check-phone?phone=${encodeURIComponent(phone)}`
            )
            return response.data.exists
        } catch (error) {
            console.error("Error checking phone:", error)
            return false
        }
    }

    const validatePassword = (password) => {
        if (!password) {
            return "Password is required"
        }
        if (password.length < 8) {
            return "Password must be at least 8 characters"
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter"
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter"
        }
        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number"
        }
        return ""
    }

    const validateConfirmPassword = (confirmPassword, password) => {
        if (!confirmPassword) {
            return "Please confirm your password"
        }
        if (confirmPassword !== password) {
            return "Passwords do not match"
        }
        return ""
    }

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))

        // Real-time validation
        let error = ""
        switch (id) {
            case "username":
                error = validateUsername(value)
                break
            case "email":
                error = validateEmail(value)
                break
            case "city":
                error = validateCity(value)
                break
            case "phone":
                error = validatePhone(value)
                // Check phone uniqueness if validation passes
                if (!error && value.trim()) {
                    setIsCheckingPhone(true)
                    // Debounce the API call
                    const timeoutId = setTimeout(async () => {
                        const exists = await checkPhoneExists(value)
                        if (exists) {
                            setErrors(prev => ({ 
                                ...prev, 
                                phone: "This phone number is already registered" 
                            }))
                        }
                        setIsCheckingPhone(false)
                    }, 500)
                    // Clear previous timeout
                    return () => clearTimeout(timeoutId)
                }
                break
            case "password":
                error = validatePassword(value)
                // Also revalidate confirm password if it has a value
                if (formData.confirmPassword) {
                    setErrors(prev => ({
                        ...prev,
                        confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
                    }))
                }
                break
            case "confirmPassword":
                error = validateConfirmPassword(value, formData.password)
                break
            default:
                break
        }

        setErrors(prev => ({ ...prev, [id]: error }))
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const uploadImageToCloudinary = async () => {
        if (!imageFile) return "";
        
        try {
            const formData = new FormData();
            formData.append("image", imageFile); // Changed from "file" to "image" to match backend
            
            console.log("Uploading image to backend...");
            
            // Upload to your backend server instead of directly to Cloudinary
            const response = await axios.post(
                "http://localhost:8800/api/upload/single",
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            if (response.data.success) {
                const imageUrl = `http://localhost:8800${response.data.imagePath}`;
                console.log("Image uploaded successfully:", imageUrl);
                return imageUrl;
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            // Return empty string if upload fails - allow registration without image
            return "";
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLocalError("")
        
        // Validate all fields before submission
        const newErrors = {
            username: validateUsername(formData.username),
            email: validateEmail(formData.email),
            city: validateCity(formData.city),
            phone: validatePhone(formData.phone),
            password: validatePassword(formData.password),
            confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
        }
        
        setErrors(newErrors)
        
        // Check if there are any errors
        const hasErrors = Object.values(newErrors).some(error => error !== "")
        if (hasErrors) {
            setLocalError("Please fix all validation errors before submitting")
            return
        }

        // Check phone uniqueness before submission
        const phoneExists = await checkPhoneExists(formData.phone)
        if (phoneExists) {
            setErrors(prev => ({ 
                ...prev, 
                phone: "This phone number is already registered" 
            }))
            setLocalError("This phone number is already registered")
            return
        }

        setIsLoading(true)

        try {
            console.log("Starting registration process...")
            // Clear old token from localStorage
            // localStorage.removeItem("token");
            // localStorage.removeItem("user");
            let imageUrl = ""
            if (imageFile) {
                console.log("Uploading image...")
                imageUrl = await uploadImageToCloudinary()
                console.log("Image upload result:", imageUrl ? "success" : "skipped")
            }

            // Prepare registration data - only include img if it exists
            const registrationData = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                city: formData.city,
                country: formData.country
            };
            
            // Only add img field if we have a valid image URL
            if (imageUrl && imageUrl.trim() !== "") {
                registrationData.img = imageUrl;
            }

            // Send registration request
            console.log("Sending registration request...", registrationData)
            const registerResponse = await axios.post(
                "http://localhost:8800/api/auth/register", 
                registrationData,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            localStorage.setItem("token", registerResponse.data.token)
            console.log("Registration successful:", registerResponse.data)

            // Auto-login after registration

            const token = localStorage.getItem("token");
            console.log("Attempting auto-login...")
            const loginRes = await axios.post(
                "http://localhost:8800/api/auth/login", 
                {
                    username: formData.username,
                    password: formData.password
                },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            console.log("Login successful:", loginRes.data)

            // Save user data and token
            if (loginRes.data.details) {
                localStorage.setItem("user", JSON.stringify(loginRes.data.details))
            }
            if (loginRes.data.token) {
                localStorage.setItem("token", loginRes.data.token)
            }

            // Update auth context
            dispatch({ type: "LOGIN_SUCCESS", payload: loginRes.data.details })
            
            toast.success("Registered successfully");
            toast.success(`Welcome, ${loginRes.data.username}`)
            navigate("/")
            
        } catch (err) {
            console.error("Registration error:", err)
            console.error("Error response:", err.response?.data)
            
            let errorMessage = "Registration failed. Please try again."
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message
            } else if (err.message) {
                errorMessage = err.message
            }

            if (errorMessage.toLowerCase().includes("username")) {
                setLocalError("Username is already taken.")
            } else if (errorMessage.toLowerCase().includes("email")) {
                setLocalError("Email is already registered.")
            } else if (errorMessage.toLowerCase().includes("cors")) {
                setLocalError("Network error. Please check if the server is running.")
            } else {
                setLocalError(errorMessage)
            }
            
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <Navbar />
            <div className="register-container">
                <div className="register-card">
                    <div className="register-header">
                        <h1 className="register-title">Create Account</h1>
                        <p className="register-description">Fill in your information to register for an account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="register-form">
                        {/* Profile Image */}
                        <div className="profile-upload-container">
                            <div className="profile-image-wrapper">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Profile preview" className="profile-image" />
                                ) : (
                                    <div className="profile-placeholder">
                                        <User className="w-8 h-8 text-gray-400" />
                                    </div>
                                )}
                                <label htmlFor="img" className="profile-upload-button">
                                    <Upload size={16} />
                                </label>
                                <input
                                    id="img"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="profile-upload-input"
                                />
                            </div>
                            <label htmlFor="img" className="profile-upload-label">
                                <Upload size={16} /> Upload Profile Image
                            </label>
                        </div>

                        {/* Username & Email */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="username" className="form-label"><User size={16} /> Username *</label>
                                <input 
                                    id="username" 
                                    type="text" 
                                    placeholder="Enter your username" 
                                    value={formData.username} 
                                    onChange={handleChange} 
                                    required 
                                    className={`form-input ${errors.username ? 'input-error' : ''}`}
                                />
                                {errors.username && <span className="field-error">{errors.username}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" className="form-label"><Mail size={16} /> Email *</label>
                                <input 
                                    id="email" 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                                />
                                {errors.email && <span className="field-error">{errors.email}</span>}
                            </div>
                        </div>

                        {/* Country & City */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="country" className="form-label"><MapPin size={16} /> Country *</label>
                                <select 
                                    id="country" 
                                    value={formData.country} 
                                    onChange={handleChange} 
                                    required 
                                    className="form-select"
                                >
                                    <option value="">Select your country</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="city" className="form-label"><MapPin size={16} /> City *</label>
                                <input 
                                    id="city" 
                                    type="text" 
                                    placeholder="Enter your city" 
                                    value={formData.city} 
                                    onChange={handleChange} 
                                    required 
                                    className={`form-input ${errors.city ? 'input-error' : ''}`}
                                />
                                {errors.city && <span className="field-error">{errors.city}</span>}
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="form-group">
                            <label htmlFor="phone" className="form-label"><Phone size={16} /> Phone Number *</label>
                            <input 
                                id="phone" 
                                type="tel" 
                                placeholder="Enter your phone number" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                required 
                                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                            />
                            {errors.phone && <span className="field-error">{errors.phone}</span>}
                        </div>

                        {/* Password & Confirm */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password" className="form-label"><Lock size={16} /> Password *</label>
                                <div className="password-container">
                                    <input 
                                        id="password" 
                                        type={showPassword ? "text" : "password"} 
                                        placeholder="Enter your password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        required 
                                        minLength={8} 
                                        className={`form-input ${errors.password ? 'input-error' : ''}`}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="password-toggle"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <span className="field-error">{errors.password}</span>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label"><Lock size={16} /> Confirm Password *</label>
                                <div className="password-container">
                                    <input 
                                        id="confirmPassword" 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        placeholder="Confirm your password" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        required 
                                        minLength={8} 
                                        className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                                        className="password-toggle"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                            </div>
                        </div>

                        {/* Errors */}
                        {localError && (
                            <div className="error-text">
                                {localError}
                            </div>
                        )}

                        {/* Submit */}
                        <button 
                            type="submit" 
                            disabled={isLoading} 
                            className="submit-button"
                        >
                            {isLoading ? (
                                <div>
                                    Creating Account...
                                </div>
                            ) : (
                                "Create Account"
                            )}
                        </button>

                        <div className="login-link-container">
                            Already have an account?{" "}
                            <button
                                onClick={() => navigate("/login")}
                                className="login-link"
                            >
                                Sign in here
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage