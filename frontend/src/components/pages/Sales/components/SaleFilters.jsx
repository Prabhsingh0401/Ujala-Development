import { useState, useEffect } from 'react';
import { Search, Building, User, Package } from 'lucide-react';
import axios from 'axios';
import { FilterGroup, FilterItem, FilterSelector } from '../../../global/FilterGroup';

const API_URL = import.meta.env.VITE_API_URL;

export function SaleFilters({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  distributorFilter,
  onDistributorFilterChange,
  factoryFilter,
  onFactoryFilterChange,
  serialNumber,
  onSerialNumberChange,
  modelFilter,
  onModelFilterChange,
  dealerFilter,
  onDealerFilterChange,
  onClearFilters
}) {
  const [distributors, setDistributors] = useState([]);
  const [factories, setFactories] = useState([]);
  const [models, setModels] = useState([]);
  const [dealers, setDealers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [distributorsRes, factoriesRes, modelsRes, dealersRes] = await Promise.all([
          axios.get(`${API_URL}/api/distributors`),
          axios.get(`${API_URL}/api/factories`),
          axios.get(`${API_URL}/api/models`),
          axios.get(`${API_URL}/api/dealers`)
        ]);
        setDistributors(distributorsRes.data);
        setFactories(factoriesRes.data);
        setModels(modelsRes.data);
        setDealers(dealersRes.data);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <FilterGroup>
        <FilterItem>
          <div className="relative flex-grow w-100">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            />
          </div>
        </FilterItem>
      </FilterGroup>

      <FilterGroup>
        <FilterItem>
          <div className="relative w-full sm:w-48">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              title="Start Date"
            />
          </div>
        </FilterItem>
        <FilterItem>
          <div className="relative w-full sm:w-48">
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              title="End Date"
            />
          </div>
        </FilterItem>
        <FilterItem>
          <FilterSelector
            value={distributorFilter}
            onChange={onDistributorFilterChange}
            options={distributors}
            placeholder="All Distributors"
            icon={User}
          />
        </FilterItem>
        <FilterItem>
          <FilterSelector
            value={factoryFilter}
            onChange={onFactoryFilterChange}
            options={factories}
            placeholder="All Factories"
            icon={Building}
          />
        </FilterItem>
        <FilterItem>
          <FilterSelector
            value={modelFilter}
            onChange={onModelFilterChange}
            options={models}
            placeholder="All Models"
            icon={Package}
          />
        </FilterItem>
        <FilterItem>
          <FilterSelector
            value={dealerFilter}
            onChange={onDealerFilterChange}
            options={dealers}
            placeholder="All Dealers"
            icon={User}
          />
        </FilterItem>
        <FilterItem>
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            <span>Clear Filters</span>
          </button>
        </FilterItem>
      </FilterGroup>
    </div>
  );
}
