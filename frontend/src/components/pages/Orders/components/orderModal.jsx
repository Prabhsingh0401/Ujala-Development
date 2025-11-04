// src/pages/Orders/components/OrderModal.jsx
import { X } from 'lucide-react';

export function OrderModal({
  isOpen,
  isEdit,
  formData,
  filteredModels,
  selectedModelDetails,
  categories,
  factories,
  onUpdateField,
  onUpdateOrderType,
  onUpdateTotalPumps,
  onSubmit,
  onClose,
  isAdding
}) {
  if (!isOpen) return null;

  const showPumpsDivisibleWarning = () => {
    if (!formData.totalPumps || !formData.orderType) return false;
    const unitsPerBox = formData.orderType === '2_units' ? 2 : 
                       formData.orderType === '3_units' ? 3 : 1;
    return unitsPerBox > 1 && formData.totalPumps % unitsPerBox !== 0;
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Order' : 'Add New Order'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4">
            {/* Month and Year Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month *</label>
                <select
                  required
                  value={formData.month}
                  onChange={(e) => onUpdateField('month', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent appearance-none bg-white"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    const monthName = new Date(2024, i).toLocaleString('default', { month: 'long' });
                    return <option key={month} value={month}>{monthName}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                <select
                  required
                  value={formData.year}
                  onChange={(e) => onUpdateField('year', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent appearance-none bg-white"
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => onUpdateField('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
              <select
                required
                value={formData.model}
                onChange={(e) => onUpdateField('model', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent appearance-none bg-white"
                disabled={!formData.category}
              >
                <option value="">Select a model</option>
                {filteredModels.map(model => (
                  <option key={model._id} value={model._id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Details Display */}
            {selectedModelDetails && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Model Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">QUANTITY</span>: {selectedModelDetails.specifications?.quantity || '1N'}</div>
                  <div><span className="font-medium">GROSS.WT</span>: {selectedModelDetails.specifications?.grossWeight}</div>
                  <div><span className="font-medium">kW/HP</span>: {selectedModelDetails.specifications?.kwHp}</div>
                  <div><span className="font-medium">Voltage</span>: {selectedModelDetails.specifications?.voltage}</div>
                  <div className="col-span-2">
                    <span className="font-medium">MRP Rs.</span>: ₹{selectedModelDetails.specifications?.mrpPrice}/- Each<br/>
                    <span className="text-xs">(Incl of all taxes)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Order Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Type *</label>
              <select
                required
                value={formData.orderType}
                onChange={(e) => onUpdateOrderType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent appearance-none bg-white"
              >
                <option value="1_unit">1N (1 Pump per Box)</option>
                <option value="2_units">2N (2 Pumps per Box)</option>
                <option value="3_units">3N (3 Pumps per Box)</option>
              </select>
            </div>

            {/* Number of Pumps */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Pumps *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.totalPumps || formData.quantity}
                onChange={(e) => onUpdateTotalPumps(parseInt(e.target.value) || '')}
                placeholder="Enter number of pumps"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent"
              />
              {(formData.totalPumps || formData.quantity) && formData.orderType && (
                <>
                  <p className="text-xs text-gray-500 mt-1">
                    Number of boxes required: {formData.quantity}
                  </p>
                  {showPumpsDivisibleWarning() && (
                    <p className="text-xs text-red-500 mt-1">
                      ⚠️ For {formData.orderType === '2_units' ? '2N' : '3N'} orders, the number of pumps must be divisible by {formData.orderType === '2_units' ? '2' : '3'}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Factory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Factory *</label>
              <select
                required
                value={formData.factory}
                onChange={(e) => onUpdateField('factory', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4d55f5] focus:border-transparent appearance-none bg-white"
              >
                <option value="">Select a factory</option>
                {factories.map(factory => (
                  <option key={factory._id} value={factory._id}>
                    {factory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isAdding}
              className="w-full px-6 py-2.5 bg-[#8B8FFF] text-white rounded-xl hover:bg-[#7B7FFF] transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
              ) : (
                isEdit ? 'Update Order' : 'Add Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}