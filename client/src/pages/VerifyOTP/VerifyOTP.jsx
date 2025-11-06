import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "./verifyOTP.css";
import { Mail, RefreshCw, ArrowLeft, Check } from "lucide-react";

const VerifyOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [email, setEmail] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timer, setTimer] = useState(900); // 15 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    
    const inputRefs = useRef([]);

    useEffect(() => {
        // Get email from location state
        if (location.state?.email) {
            setEmail(location.state.email);
        } else {
            // If no email in state, redirect to registration
            toast.error("Please register first");
            navigate("/register");
        }
    }, [location, navigate]);

    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        
        if (!/^\d+$/.test(pastedData)) {
            toast.error("Please paste a valid OTP");
            return;
        }

        const newOtp = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
        setOtp(newOtp);
        
        // Focus last filled input or last input
        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleVerify = async () => {
        const otpString = otp.join("");
        
        if (otpString.length !== 6) {
            toast.error("Please enter the complete 6-digit code");
            return;
        }

        setIsVerifying(true);

        try {
            const response = await axios.post("http://localhost:8800/api/auth/verify-otp", {
                email,
                otp: otpString
            });

            if (response.data.success) {
                toast.success("Email verified successfully!");
                toast("Redirecting to login...", { icon: "✨" });
                
                setTimeout(() => {
                    navigate("/login", { 
                        state: { 
                            message: "Your email has been verified. You can now log in!",
                            email 
                        } 
                    });
                }, 1500);
            }
        } catch (error) {
            if (error.response?.data?.expired) {
                toast.error("OTP has expired. Please request a new one.");
                setCanResend(true);
            } else {
                toast.error(error.response?.data?.message || "Invalid OTP. Please try again.");
            }
            // Clear OTP inputs on error
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsResending(true);

        try {
            const response = await axios.post("http://localhost:8800/api/auth/resend-otp", {
                email
            });

            if (response.data.success) {
                toast.success("New verification code sent! Check your email.");
                setTimer(900); // Reset timer to 15 minutes
                setCanResend(false);
                setOtp(["", "", "", "", "", ""]); // Clear existing OTP
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend code. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="verify-otp-page">
            <div className="verify-otp-container">
                <button className="back-to-register" onClick={() => navigate("/register")}>
                    <ArrowLeft size={20} />
                    Back to Register
                </button>

                <div className="verify-otp-content">
                    <div className="verify-otp-icon">
                        <Mail size={48} />
                    </div>
                    
                    <h1>Verify Your Email</h1>
                    <p className="verify-subtitle">
                        We've sent a 6-digit verification code to<br />
                        <strong>{email}</strong>
                    </p>

                    <div className="otp-inputs" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="otp-input"
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>

                    <div className="timer-section">
                        {timer > 0 ? (
                            <p className="timer-text">
                                Code expires in <span className="timer-value">{formatTime(timer)}</span>
                            </p>
                        ) : (
                            <p className="timer-expired">Code has expired</p>
                        )}
                    </div>

                    <button
                        className="verify-button"
                        onClick={handleVerify}
                        disabled={isVerifying || otp.join("").length !== 6}
                    >
                        {isVerifying ? (
                            <>
                                <div className="spinner-small"></div>
                                Verifying...
                            </>
                        ) : (
                            <>
                                <Check size={20} />
                                Verify Email
                            </>
                        )}
                    </button>

                    <div className="resend-section">
                        <p>Didn't receive the code?</p>
                        <button
                            className="resend-button"
                            onClick={handleResend}
                            disabled={!canResend || isResending}
                        >
                            {isResending ? (
                                <>
                                    <div className="spinner-small"></div>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={16} />
                                    Resend Code
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
