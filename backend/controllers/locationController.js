import { states } from '../utils/locationData.js';

// @desc    Get all states
// @route   GET /api/locations/states
// @access  Public
const getStates = (req, res) => {
  const stateNames = states.map(s => s.state);
  res.status(200).json(stateNames);
};

// @desc    Get cities by state
// @route   GET /api/locations/cities/:state
// @access  Public
const getCitiesByState = (req, res) => {
  const { state } = req.params;
  const stateData = states.find(s => s.state === state);
  if (stateData) {
    res.status(200).json(stateData.cities);
  } else {
    res.status(404).json({ message: 'State not found' });
  }
};

export { getStates, getCitiesByState };
