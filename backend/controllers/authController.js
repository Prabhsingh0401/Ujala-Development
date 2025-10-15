import User from '../models/User.js';
import Factory from '../models/Factory.js';
import PasswordResetRequest from '../models/PasswordResetRequest.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

// Helper function to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '2h',
    });
};

export const login = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        let user;
        if (role === 'factory') {
            user = await User.findOne({ 
                username, 
                role,
                isActive: true 
            }).populate('factory');
        } else if (role === 'distributor') {
            user = await User.findOne({ 
                username, 
                role,
                isActive: true 
            }).populate('distributor');
        } else {
            user = await User.findOne({ 
                username, 
                role,
                isActive: true 
            });
        }

        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const userData = {
            id: user._id,
            username: user.username,
            role: user.role,
            factory: user.factory,
            distributor: user.distributor,
            token: generateToken(user._id, user.role), // Generate and include token with role
        };

        res.json({ user: userData });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createDefaultUsers = async (req, res) => {
    try {
        // Create admin user
        const adminExists = await User.findOne({ username: 'admin', role: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword,
                role: 'admin'
            });
        }

        // Create factory users for each factory
        const factories = await Factory.find();
        for (const factory of factories) {
            const factoryUserExists = await User.findOne({ 
                username: `factory_${factory.name.toLowerCase().replace(/\s+/g, '_')}`,
                role: 'factory'
            });
            
            if (!factoryUserExists) {
                const hashedPassword = await bcrypt.hash('factory123', 10);
                await User.create({
                    username: `factory_${factory.name.toLowerCase().replace(/\s+/g, '_')}`,
                    password: hashedPassword,
                    role: 'factory',
                    factory: factory._id
                });
            }
        }

        // Create distributor users for each distributor
        const distributors = await Distributor.find();
        for (const distributor of distributors) {
            const distributorUserExists = await User.findOne({
                username: `distributor_${distributor.name.toLowerCase().replace(/\s+/g, '_')}`,
                role: 'distributor'
            });

            if (!distributorUserExists) {
                const hashedPassword = await bcrypt.hash('distributor123', 10);
                await User.create({
                    username: `distributor_${distributor.name.toLowerCase().replace(/\s+/g, '_')}`,
                    password: hashedPassword,
                    role: 'distributor',
                    distributor: distributor._id
                });
            }
        }

        res.json({ message: 'Default users created successfully' });
    } catch (error) {
        console.error('Error creating default users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getFactoryUsers = async (req, res) => {
    try {
        const factoryUsers = await User.find({ role: 'factory' }).populate('factory');
        res.json(factoryUsers);
    } catch (error) {
        console.error('Error fetching factory users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        const { username, role } = req.body; // Expect role in request body
        
        let user;
        if (role === 'factory') {
            user = await User.findOne({ username, role }).populate('factory');
        } else if (role === 'distributor') {
            user = await User.findOne({ username, role }).populate('distributor');
        } else {
            return res.status(400).json({ message: 'Invalid role for password reset' });
        }

        if (!user) {
            return res.status(404).json({ message: `${role} user not found` });
        }
        
        const existingRequest = await PasswordResetRequest.findOne({ 
            username, 
            status: 'pending',
            role: role // Add role to the query
        });
        
        if (existingRequest) {
            return res.status(400).json({ message: 'Password reset request already pending' });
        }
        
        const newRequestData = {
            username,
            role,
        };

        if (role === 'factory') {
            newRequestData.factory = user.factory._id;
        } else if (role === 'distributor') {
            newRequestData.distributor = user.distributor._id;
        }

        await PasswordResetRequest.create(newRequestData);
        
        res.json({ message: 'Password reset request sent to admin' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPasswordResetRequests = async (req, res) => {
    try {
        const requests = await PasswordResetRequest.find({ status: 'pending' })
            .populate('factory')
            .populate('distributor') // Populate distributor as well
            .sort({ requestedAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error('Error fetching password reset requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { requestId, newPassword } = req.body;
        
        const request = await PasswordResetRequest.findById(requestId);
        if (!request || request.status !== 'pending') {
            return res.status(404).json({ message: 'Invalid or completed request' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne(
            { username: request.username, role: request.role }, // Use role from request
            { password: hashedPassword }
        );
        
        request.status = 'completed';
        request.completedAt = new Date();
        await request.save();
        
        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};