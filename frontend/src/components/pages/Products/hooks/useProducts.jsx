import { useState, useEffect, useCallback, useMemo } from 'react'; // Import useMemo
import { productService } from '../services/productServices.js';
import { toast } from 'react-hot-toast';

export const useProducts = (modelFilter) => { // Accept modelFilter as a prop
  const [allProducts, setAllProducts] = useState([]); // All raw individual products
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.fetchProducts(); // Fetch all products
      setAllProducts(response.data); // Store all products

    } catch (error) {
      toast.error('Error fetching products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []); // No modelFilter dependency here, as we fetch all

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Frontend filtering logic
  const filteredProducts = useMemo(() => {
    if (!modelFilter) {
      return allProducts;
    }
    return allProducts.filter(product =>
      product.model?.name.toLowerCase().includes(modelFilter.toLowerCase())
    );
  }, [allProducts, modelFilter]);

  // Group filtered products by orderId and boxNumber
  const groupedProducts = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      const key = `${product.orderId}-${product.boxNumber}`;
      if (!acc[key]) {
        acc[key] = {
          _id: key, // This _id is for the grouped row, not for selection
          orderId: product.orderId,
          boxNumber: product.boxNumber,
          productName: product.productName, // Assuming all products in a box have same name
          category: product.category,
          model: product.model,
          price: product.price, // Assuming all products in a box have same price
          factory: product.factory,
          status: product.status, // This might vary per product in box, need to decide how to display
          orderType: product.orderType,
          distributor: product.distributor, // Assuming all products in a box have same distributor
          productsInBox: [], // Array to hold individual product objects
        };
      }
      acc[key].productsInBox.push(product); // Push the entire product object
      return acc;
    }, {});
    console.log('Grouped Products:', grouped); // Add console log here
    return Object.values(grouped);
  }, [filteredProducts]); // Dependency on filteredProducts

  return {
    products: groupedProducts, // Return grouped products for display
    loading,
    fetchProducts,
  };
};