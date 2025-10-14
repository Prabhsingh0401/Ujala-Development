export const groupProductsByConfiguration = (products) => {
    const grouped = products.reduce((acc, product) => {
        // Use a combination of orderId and boxNumber for grouping, similar to useProducts hook
        const key = `${product.orderId}-${product.boxNumber}`;
        if (!acc[key]) {
            acc[key] = {
                _id: key,
                orderId: product.orderId,
                boxNumber: product.boxNumber,
                productName: product.productName,
                category: product.category,
                model: product.model,
                price: product.price,
                factory: product.factory,
                status: product.status,
                orderType: product.orderType,
                distributor: product.distributor,
                productsInBox: [],
            };
        }
        acc[key].productsInBox.push(product);
        return acc;
    }, {});
    return Object.values(grouped);
};

export const getOrderTypeDisplay = (orderType) => {
    const types = {
      '1_unit': { label: '1 Unit/Box', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      '2_units': { label: '2 Units/Box', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      '3_units': { label: '3 Units/Box', bgColor: 'bg-purple-100', textColor: 'text-purple-800' }
    };
    return types[orderType] || types['1_unit'];
  };
