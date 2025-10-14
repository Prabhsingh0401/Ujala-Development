import asyncHandler from 'express-async-handler';
import Dealer from '../models/Dealer.js';

// @desc    Get all dealers for a distributor (from query param)
// @route   GET /api/distributor/dealers?distributorId=...
// @access  Private
const getDealers = asyncHandler(async (req, res) => {
    const { distributorId } = req.query;
    const dealers = await Dealer.find({ distributor: distributorId });
    res.json(dealers);
});

// @desc    Get dealers for a specific distributor (from URL param)
// @route   GET /api/distributor/dealers/:distributorId
// @access  Private
const getDistributorDealers = asyncHandler(async (req, res) => {
    const { distributorId } = req.params;
    const dealers = await Dealer.find({ distributor: distributorId });
    res.json(dealers);
});

// @desc    Create a new dealer for a distributor
// @route   POST /api/distributor/dealers
// @access  Private
const createDealer = asyncHandler(async (req, res) => {
    const { name, location, territory, contactPerson, contactPhone, email, status, distributorId } = req.body;

    // Find the latest dealer to get the last dealer ID
    const latestDealer = await Dealer.findOne().sort({ dealerId: -1 });
    
    // Generate new dealer ID
    let newDealerId;
    if (latestDealer) {
        const lastNumber = parseInt(latestDealer.dealerId.replace('DEAL', ''));
        newDealerId = `DEAL${String(lastNumber + 1).padStart(5, '0')}`;
    } else {
        newDealerId = 'DEAL00001';
    }

    const dealer = new Dealer({
        dealerId: newDealerId,
        name,
        location,
        territory,
        contactPerson,
        contactPhone,
        email,
        status,
        distributor: distributorId
    });

    const createdDealer = await dealer.save();
    res.status(201).json(createdDealer);
});

// @desc    Update a dealer for a distributor
// @route   PUT /api/distributor/dealers/:id
// @access  Private
const updateDealer = asyncHandler(async (req, res) => {
    const { name, location, territory, contactPerson, contactPhone, email, status, distributorId } = req.body;

    const dealer = await Dealer.findById(req.params.id);

    if (dealer && dealer.distributor.toString() === distributorId) {
        dealer.name = name;
        dealer.location = location;
        dealer.territory = territory;
        dealer.contactPerson = contactPerson;
        dealer.contactPhone = contactPhone;
        dealer.email = email;
        dealer.status = status;

        const updatedDealer = await dealer.save();
        res.json(updatedDealer);
    } else {
        res.status(404);
        throw new Error('Dealer not found or not authorized');
    }
});

// @desc    Delete a dealer for a distributor
// @route   DELETE /api/distributor/dealers/:id
// @access  Private
const deleteDealer = asyncHandler(async (req, res) => {
    const { distributorId } = req.body;
    const dealer = await Dealer.findById(req.params.id);

    if (dealer && dealer.distributor.toString() === distributorId) {
        await dealer.remove();
        res.json({ message: 'Dealer removed' });
    } else {
        res.status(404);
        throw new Error('Dealer not found or not authorized');
    }
});

export { getDealers, getDistributorDealers, createDealer, updateDealer, deleteDealer };