import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { FilterGroup, FilterItem, FilterSelector } from '../../../global/FilterGroup';

export const CustomerFilters = ({
    searchTerm,
    onSearchChange,
    stateFilter,
    onStateFilterChange,
    cityFilter,
    onCityFilterChange,
    states,
    cities,
    onClearFilters
}) => {
    return (
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
            <FilterItem>
                <FilterSelector
                    value={stateFilter}
                    onChange={onStateFilterChange}
                    options={states.map(s => ({ _id: s, name: s }))}
                    placeholder="All States"
                    icon={MapPin}
                />
            </FilterItem>
            <FilterItem>
                <FilterSelector
                    value={cityFilter}
                    onChange={onCityFilterChange}
                    options={cities.map(c => ({ _id: c, name: c }))}
                    placeholder="All Cities"
                    icon={MapPin}
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
    );
};
