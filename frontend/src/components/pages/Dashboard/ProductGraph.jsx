
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { orderService } from '../Orders/services/orderServices';

const ProductGraph = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await orderService.fetchAllOrderItems();
        const orderItems = response.data;

        // Process data to get counts of completed and dispatched products
        const processedData = orderItems.reduce((acc, item) => {
          const date = new Date(item.createdAt).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = { date, completed: 0, dispatched: 0 };
          }
          if (item.status === 'Completed') {
            acc[date].completed += 1;
          }
          if (item.status === 'Dispatched') {
            acc[date].dispatched += 1;
          }
          return acc;
        }, {});

        setData(Object.values(processedData));
      } catch (error) {
        console.error('Error fetching order items:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 0,
            bottom: 5,
          }}
        >
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="completed" stroke="#82ca9d" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="dispatched" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductGraph;
