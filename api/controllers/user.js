import User from '../models/User.js';
import { createError } from '../utils/error.js';
import bcrypt from 'bcryptjs';

// GET ALL USERS (Admin only)
export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password'); // Exclude password
        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (err) {
        next(err);
    }
};

// GET SINGLE USER (Self or Admin)
export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return next(createError(404, 'User not found'));
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

// UPDATE USER (Self or Admin)
export const updateUser = async (req, res, next) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) return next(createError(404, 'User not found'));
        res.status(200).json(updatedUser);
    } catch (err) {
        next(err);
    }
};

// DELETE USER (Self or Admin)
export const deleteUser = async (req, res, next) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return next(createError(404, 'User not found'));
        res.status(200).json({ message: 'User has been deleted.' });
    } catch (err) {
        next(err);
    }
};

// Controller to get user role by ID
export const getUserRole = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId).select("role username email"); 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({
            username: user.username,
            email: user.email,
            role: user.role,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// Check if phone number already exists
export const checkPhoneExists = async (req, res) => {
    try {
        const { phone } = req.query;
        
        if (!phone) {
            return res.status(400).json({ 
                success: false,
                message: "Phone number is required" 
            });
        }

        const user = await User.findOne({ phone: phone });
        
        res.status(200).json({
            success: true,
            exists: !!user
        });
    } catch (err) {
        console.error("Error checking phone:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error" 
        });
    }
};

// Change Password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From verifyToken middleware

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        // Validate new password length
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 8 characters long"
            });
        }

        // Find user with password
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // Hash new password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (err) {
        console.error("Error changing password:", err);
        res.status(500).json({
            success: false,
            message: "Server error. Please try again later."
        });
    }
};