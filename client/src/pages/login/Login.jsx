import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import "./login.css";
import Navbar from "../../components/navbar/Navbar";
import {toast} from "react-hot-toast"

const Login = () => {
    const [credentials, setCredentials] = useState({
        identifier: "", 
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const { loading, error, dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }));
    };

    const handleClick = async (e) => {
        e.preventDefault();
        dispatch({ type: "LOGIN_START" });

        

        try {
            // Clear old token from localStorage
            // localStorage.removeItem("token");
            // localStorage.removeItem("user");
            console.log("Trying to login");
            // Determine if identifier is email or username
            const isEmail = credentials.identifier.includes('@');
            
            const loginData = {
                [isEmail ? 'email' : 'username']: credentials.identifier,
                password: credentials.password
            };

            // Get token from localStorage if it exists
            const token = localStorage.getItem("token");
            
            const res = await axios.post("http://localhost:8800/api/auth/login", loginData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            console.log("Login response", res.data)

            // Save user and token to localStorage
            localStorage.setItem("user", JSON.stringify(res.data.details));
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }

            dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });
            toast.success("Logged in successfully");
            toast.success(`Welcome ${res.data.details.username}`)
            navigate("/");
        } catch (err) {
            console.log("Login failed");
            toast.error("Login failed");
            dispatch({
                type: "LOGIN_FAILURE",
                payload: err.response?.data || { message: "Login failed." },
            });
        }
    };

    const handleForgotPassword = () => {
        navigate("/forgot-password");
    };

    return (
        <div>
            <Navbar />
            <div className="login-container">
                <div className="login-box">
                    <div className="brand-section">
                        <div className="brand-tagline">
                            <MapPin className="icon-small" />
                            <span>Discover the Beauty of Nepal</span>
                        </div>
                    </div>

                    <div className="form-wrapper">
                        <div className="form-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to your YatraNepal account to continue your journey</p>
                        </div>

                        <form onSubmit={handleClick} className="login-form">
                            <div className="form-group">
                                <label htmlFor="identifier">Username or Email</label>
                                <input
                                    id="identifier"
                                    type="text"
                                    value={credentials.identifier}
                                    onChange={handleChange}
                                    placeholder="Enter your username or email"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="password-wrapper">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={credentials.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="toggle-password"
                                    >
                                        {showPassword ? <EyeOff className="icon-small" /> : <Eye className="icon-small" />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="checkbox-label">
                                    <input type="checkbox" />
                                    Remember me
                                </label>
                                <button type="button" className="forgot-link" onClick={handleForgotPassword}>
                                    Forgot password?
                                </button>
                            </div>

                            <button type="submit" disabled={loading} className="submit-button">
                                {loading ? (
                                    <div className="loading-spinner">
                                        <div className="spinner"></div>
                                        Signing In...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </button>

                            {error && <span className="error-text">{error.message}</span>}
                        </form>

                        <div className="signup-link">
                            Don't have an account?{" "}
                            <button
                                onClick={() => navigate("/register")}
                                className="link-button"
                            >
                                Sign up here
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
