import ReplacementRequest from '../models/ReplacementRequest.js';
import Technician from '../models/Technician.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const createTechnician = async (req, res) => {
    const { name, phone, address, state, city, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        const existingTechnician = await Technician.findOne({ phone });
        if (existingTechnician) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            role: 'technician',
        });

        const savedUser = await newUser.save();

        const newTechnician = new Technician({
            user: savedUser._id,
            name,
            phone,
            address,
            state,
            city,
        });

        const savedTechnician = await newTechnician.save();

        const populatedTechnician = await Technician.findById(savedTechnician._id).populate('user', 'username');

        res.status(201).json(populatedTechnician);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTechnicians = async (req, res) => {
    try {
        const technicians = await Technician.find().populate('user', 'username');
        res.json(technicians);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTechnician = async (req, res) => {
    const { id } = req.params;
    const { name, phone, address, state, city, username, password } = req.body;

    try {
        const technician = await Technician.findById(id);

        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        const user = await User.findById(technician.user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username) {
            user.username = username;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        technician.name = name || technician.name;
        technician.phone = phone || technician.phone;
        technician.address = address || technician.address;
        technician.state = state || technician.state;
        technician.city = city || technician.city;

        const updatedTechnician = await technician.save();
        res.json(updatedTechnician);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteTechnician = async (req, res) => {
    const { id } = req.params;

    try {
        const technician = await Technician.findById(id);

        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        await User.findByIdAndDelete(technician.user);
        await Technician.findByIdAndDelete(id);

        res.json({ message: 'Technician deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAssignedRequests = async (req, res) => {
    try {
        const technician = await Technician.findOne({ user: req.user.id });
        if (!technician) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        const requests = await ReplacementRequest.find({ assignedTechnician: technician._id })
            .populate({
                path: 'product',
                select: 'name serialNumber',
            })
            .populate({
                path: 'customer',
                select: 'name',
            });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
