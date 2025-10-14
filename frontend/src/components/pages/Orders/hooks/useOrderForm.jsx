import { useState, useEffect } from 'react';

const initialOrderState = {
  category: '',
  model: '',
  quantity: '',
  totalPumps: '',
  factory: '',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  status: 'Pending',
  orderType: '1_unit'
};

export const useOrderForm = (isEdit = false, editOrder = null, models = []) => {
  const [formData, setFormData] = useState(initialOrderState);
  const [filteredModels, setFilteredModels] = useState([]);
  const [selectedModelDetails, setSelectedModelDetails] = useState(null);

  useEffect(() => {
    if (isEdit && editOrder) {
      const totalPumps = editOrder.quantity * 
        (editOrder.orderType === '2_units' ? 2 : 
         editOrder.orderType === '3_units' ? 3 : 1);
      
      setFormData({
        category: editOrder.category?._id || '',
        model: editOrder.model?._id || '',
        quantity: editOrder.quantity,
        totalPumps: totalPumps,
        factory: editOrder.factory?._id || '',
        month: editOrder.month || new Date().getMonth() + 1,
        year: editOrder.year || new Date().getFullYear(),
        status: editOrder.status || 'Pending',
        orderType: editOrder.orderType || '1_unit'
      });

      if (editOrder.model) {
        setSelectedModelDetails(editOrder.model);
      }

      if (editOrder.category?._id) {
        const categoryModels = models.filter(m => m.category?._id === editOrder.category._id);
        setFilteredModels(categoryModels);
      }
    } else {
      resetForm();
    }
  }, [isEdit, editOrder, models]);

  useEffect(() => {
    if (formData.category) {
      const categoryModels = models.filter(m => m.category?._id === formData.category);
      setFilteredModels(categoryModels);
      if (!isEdit) {
        setFormData(prev => ({ ...prev, model: '' }));
        setSelectedModelDetails(null);
      }
    } else {
      setFilteredModels([]);
      if (!isEdit) {
        setSelectedModelDetails(null);
      }
    }
  }, [formData.category, models, isEdit]);

  useEffect(() => {
    if (formData.model) {
      const selectedModel = models.find(m => m._id === formData.model);
      setSelectedModelDetails(selectedModel || null);
    } else {
      setSelectedModelDetails(null);
    }
  }, [formData.model, models]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateOrderType = (orderType) => {
    const totalPumps = formData.totalPumps || formData.quantity;
    const unitsPerBox = orderType === '2_units' ? 2 : orderType === '3_units' ? 3 : 1;
    
    setFormData(prev => ({
      ...prev,
      orderType,
      totalPumps,
      quantity: Math.ceil(totalPumps / unitsPerBox)
    }));
  };

  const updateTotalPumps = (totalPumps) => {
    const unitsPerBox = formData.orderType === '2_units' ? 2 : 
                       formData.orderType === '3_units' ? 3 : 1;
    
    setFormData(prev => ({
      ...prev,
      totalPumps: totalPumps || '',
      quantity: totalPumps ? Math.ceil(totalPumps / unitsPerBox) : ''
    }));
  };

  const resetForm = () => {
    setFormData(initialOrderState);
    setFilteredModels([]);
    setSelectedModelDetails(null);
  };

  const validateForm = () => {
    const requiredFields = ['category', 'model', 'totalPumps', 'factory', 'orderType'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return { valid: false, error: `Please fill in all required fields: ${missingFields.join(', ')}` };
    }

    if (formData.totalPumps <= 0) {
      return { valid: false, error: 'Number of pumps must be greater than 0' };
    }

    const unitsPerBox = formData.orderType === '2_units' ? 2 : 
                       formData.orderType === '3_units' ? 3 : 1;
    
    if (unitsPerBox > 1 && formData.totalPumps % unitsPerBox !== 0) {
      return { 
        valid: false, 
        error: `For ${unitsPerBox}N orders, the number of pumps must be divisible by ${unitsPerBox}` 
      };
    }

    return { valid: true };
  };

  const getSubmitData = () => {
    const unitsPerBox = formData.orderType === '2_units' ? 2 : 
                       formData.orderType === '3_units' ? 3 : 1;
    
    return {
      ...formData,
      totalPumps: parseInt(formData.totalPumps),
      quantity: Math.ceil(parseInt(formData.totalPumps) / unitsPerBox)
    };
  };

  return {
    formData,
    filteredModels,
    selectedModelDetails,
    updateField,
    updateOrderType,
    updateTotalPumps,
    resetForm,
    validateForm,
    getSubmitData
  };
};