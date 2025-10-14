import Dealer from '../models/Dealer.js';
import Distributor from '../models/Distributor.js';

export const getDealers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } },
                    { territory: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const dealers = await Dealer.find(query).populate('distributor').sort({ createdAt: -1 });
        res.json(dealers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createDealer = async (req, res) => {
    try {
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
            ...req.body,
            dealerId: newDealerId
        });

        const createdDealer = await dealer.save();

        if (req.body.distributor) {
            await Distributor.findByIdAndUpdate(
                req.body.distributor,
                { $push: { dealers: createdDealer._id } },
                { new: true, useFindAndModify: false }
            );
        }

        res.status(201).json(createdDealer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateDealer = async (req, res) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found' });
        }

        const updatedDealer = await Dealer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        // If the distributor is changed, update the old and new distributors
        if (req.body.distributor && dealer.distributor?.toString() !== req.body.distributor) {
            // Remove dealer from old distributor
            if (dealer.distributor) {
                await Distributor.findByIdAndUpdate(
                    dealer.distributor,
                    { $pull: { dealers: dealer._id } }
                );
            }

            // Add dealer to new distributor
            await Distributor.findByIdAndUpdate(
                req.body.distributor,
                { $push: { dealers: dealer._id } }
            );
        }

        res.json(updatedDealer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteDealer = async (req, res) => {
    try {
        const dealer = await Dealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({ message: 'Dealer not found' });
        }

        // Remove dealer from associated distributor's dealers array
        if (dealer.distributor) {
            await Distributor.findByIdAndUpdate(
                dealer.distributor,
                { $pull: { dealers: dealer._id } }
            );
        }

        await dealer.deleteOne();
        res.json({ message: 'Dealer removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};