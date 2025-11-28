import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:9001/api/v1/auth/all', {
        headers: {
          // Add auth token header if needed, for example:
          // Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data)
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setActionMessage('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const freezeUser = async (userId) => {
    // const reason = prompt("Enter reason for freezing account:");
    // if (!reason) return;
    try {
      const response = await axios.put(
        `http://localhost:9001/api/v1/auth/${userId}/freeze`,
        null,
        {
          // params: { reason },
          // headers: { Authorization: `Bearer ${token}` }
        }
      );
      setActionMessage(response.data);
      fetchUsers();
    } catch (error) {
      console.error('Error freezing user:', error);
      setActionMessage('Failed to freeze user.');
    }
  };

  const unfreezeUser = async (userId) => {
    try {
      const response = await axios.put(
        `http://localhost:9001/api/v1/auth/${userId}/unfreeze`,
        null,
        {
          // headers: { Authorization: `Bearer ${token}` }
        }
      );
      setActionMessage(response.data);
      fetchUsers();
    } catch (error) {
      console.error('Error unfreezing user:', error);
      setActionMessage('Failed to unfreeze user.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>User Management</h2>
      {loading && <p>Loading users...</p>}
      {actionMessage && <p>{actionMessage}</p>}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && !loading && <tr><td colSpan="6">No users found.</td></tr>}
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name || '-'}</td>
              <td>{user.email}</td>
              <td>{user.status}</td>
              <td>{user.role}</td>
              <td>
                {user.status === 'UNFROZEN' ? (
                  <button onClick={() => freezeUser(user.id)}>Freeze</button>
                ) : (
                  <button onClick={() => unfreezeUser(user.id)}>Unfreeze</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserManagement;
