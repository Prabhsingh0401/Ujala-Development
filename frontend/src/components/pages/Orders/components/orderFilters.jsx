import { Search } from 'lucide-react';

export function OrderFilters({
  searchTerm,
  onSearchChange,
  factoryFilter,
  onFactoryFilterChange,
  orderTypeFilter,
  onOrderTypeFilterChange,
  dispatchedFilter,
  onDispatchedFilterChange,
  factories,
  onAddOrder
}) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
      <div className="relative flex-1 sm:flex-none">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
        />
      </div>

      <select
        value={factoryFilter}
        onChange={(e) => onFactoryFilterChange(e.target.value)}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
      >
        <option value="all">All Factories</option>
        {factories.map(factory => (
          <option key={factory._id} value={factory._id}>{factory.name}</option>
        ))}
      </select>

      <select
        value={orderTypeFilter}
        onChange={(e) => onOrderTypeFilterChange(e.target.value)}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
      >
        <option value="all">All Types</option>
        <option value="1_unit">1N</option>
        <option value="2_units">2N</option>
        <option value="3_units">3N</option>
      </select>

      <select
        value={dispatchedFilter}
        onChange={(e) => onDispatchedFilterChange(e.target.value)}
        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
      >
        <option value="all">All Dispatched</option>
        <option value="true">Dispatched</option>
        <option value="false">Not Dispatched</option>
      </select>

      <button
        onClick={onAddOrder}
        className="flex items-center justify-center space-x-2 bg-[#4d55f5] text-white px-4 py-2 rounded-lg hover:bg-[#3d45e5] transition-colors"
      >
        <span>+ New Order</span>
      </button>
    </div>
  );
}