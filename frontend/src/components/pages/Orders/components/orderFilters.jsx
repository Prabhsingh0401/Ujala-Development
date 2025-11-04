import { Search, Building, Package } from 'lucide-react';
import { FilterGroup, FilterItem, FilterSelector } from '../../../global/FilterGroup';

export function OrderFilters({
  searchTerm,
  onSearchChange,
  factoryFilter,
  onFactoryFilterChange,
  orderTypeFilter,
  onOrderTypeFilterChange,
  dispatchedFilter,
  onDispatchedFilterChange,
  modelFilter,
  onModelFilterChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  factories,
  models,
  onAddOrder,
  onClearFilters
}) {
  return (
    <div className="space-y-4">
      <FilterGroup>
        <FilterItem>
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
            />
          </div>
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
          <select
            value={orderTypeFilter}
            onChange={(e) => onOrderTypeFilterChange(e.target.value)}
            className="w-full sm:w-48 pl-4 pr-10 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm appearance-none"
          >
            <option value="all">All Types</option>
            <option value="1_unit">1N</option>
            <option value="2_units">2N</option>
            <option value="3_units">3N</option>
          </select>
        </FilterItem>
      </FilterGroup>

      <FilterGroup>
        <FilterItem>
          <div className="relative w-full sm:w-48">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              title="Start Date"
            />
          </div>
        </FilterItem>
        <FilterItem>
          <div className="relative w-full sm:w-48">
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              title="End Date"
            />
          </div>
        </FilterItem>
        <FilterItem>
          <button
            onClick={onClearFilters}
            className="flex items-center justify-center bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            <span>Clear Filters</span>
          </button>
        </FilterItem>
        <FilterItem>
          <button
            onClick={onAddOrder}
            className="flex items-center justify-center bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <span>+ New Order</span>
          </button>
        </FilterItem>
      </FilterGroup>
    </div>
  );
}