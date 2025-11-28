import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminSellerManagement = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:9001/api/auth/seller/all', {
        // headers: { Authorization: `Bearer ${token}` } // Add auth if required
      });
      setSellers(response.data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      setActionMessage('Failed to load sellers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const freezeSeller = async (sellerId) => {
    
    try {
      const response = await axios.put(
        `http://localhost:9001/api/auth/seller/${sellerId}/freeze`,
        null,
        {
          // params: { reason },
          // headers: { Authorization: `Bearer ${token}` }
        }
      );
      setActionMessage(response.data);
      fetchSellers();
    } catch (error) {
      console.error('Error freezing seller:', error);
      setActionMessage('Failed to freeze seller.');
    }
  };

  const unfreezeSeller = async (sellerId) => {
    try {
      const response = await axios.put(
        `http://localhost:9001/api/auth/seller/${sellerId}/unfreeze`,
        null,
        {
          // headers: { Authorization: `Bearer ${token}` }
        }
      );
      setActionMessage(response.data);
      fetchSellers();
    } catch (error) {
      console.error('Error unfreezing seller:', error);
      setActionMessage('Failed to unfreeze seller.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Seller Management</h2>
      {loading && <p>Loading sellers...</p>}
      {actionMessage && <p>{actionMessage}</p>}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Seller ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sellers.length === 0 && !loading && <tr><td colSpan="5">No sellers found.</td></tr>}
          {sellers.map((seller) => (
            <tr key={seller.id}>
              <td>{seller.id}</td>
              <td>{seller.name || '-'}</td>
              <td>{seller.email}</td>
              <td>{seller.status}</td>
              <td>
                {seller.status === 'UNFROZEN' ? (
                  <button onClick={() => freezeSeller(seller.id)}>Freeze</button>
                ) : (
                  <button onClick={() => unfreezeSeller(seller.id)}>Unfreeze</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSellerManagement;
