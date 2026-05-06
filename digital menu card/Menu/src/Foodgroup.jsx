// Final Updated Code for Foodgroup.jsx
import Button from 'react-bootstrap/Button';
import Navb from './Navb';
import axios from 'axios';
import './Menu.css';
import { useEffect, useState } from 'react';

export default function Foodgroup() {
  const [fd, setFg] = useState('');
  const [data, setData] = useState([]);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  function fetchData() {
    axios
      .get('http://localhost:3000/food_group')
      .then((response) => {
        setData(response.data.food_group || []);
      })
      .catch((error) => {
        console.error('Error fetching food group!', error);
      });
  }

  const handleInputChange = (e) => setFg(e.target.value);

  function handleSubmit() {
    if (!fd.trim()) {
      alert('Please enter a valid food group name');
      return;
    }

    const payload = { group_name: fd, gid: selectedId };
    const request = isUpdateMode
      ? axios.put('http://localhost:3000/updfoodgroup', payload)
      : axios.post('http://localhost:3000/addfoodgroup', { group_name: fd });

    request
      .then(() => {
        alert(`Food group ${isUpdateMode ? 'updated' : 'added'} successfully`);
        resetForm();
        fetchData();
      })
      .catch((error) => {
        console.error('Error submitting food group:', error);
      });
  }

  function handleDelete(id) {
    axios
      .delete('http://localhost:3000/delfoodgroup', { data: { gid: id } })
      .then((response) => {
        alert(response.data.message);
        fetchData();
        resetForm();
      })
      .catch((error) => {
        console.error('Error deleting food group:', error);
        alert('Failed to delete food group.');
      });
  }

  function prepareUpdate(gid, group_name) {
    setIsUpdateMode(true);
    setFg(group_name);
    setSelectedId(gid);
  }

  function resetForm() {
    setFg('');
    setSelectedId(null);
    setIsUpdateMode(false);
  }

  return (
    <div className="app-container">
      <div className="card">
        <div className="card-header">
          <h1>Food Group</h1>
          <Navb />
        </div>

        <div className="input-section">
          <input
            type="text"
            value={fd}
            onChange={handleInputChange}
            className="form-input"
            placeholder="Enter food group name"
          />
          <div className="form-buttons">
          <Button
            variant={isUpdateMode ? 'outline-primary' : 'outline-success'}
            onClick={handleSubmit}
            className="add-button"
          >
            {isUpdateMode ? 'Update' : 'Add'}
          </Button>
          {isUpdateMode && (
            <Button variant="outline-secondary" onClick={resetForm}>Cancel</Button>
          )}
          </div>
        </div>

        <div className="table-wrapper">
          <div className="menu-table-wrapper-scrollable">
            <table className="menu-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>GID</th>
                  <th>Group Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.gid}</td>
                      <td>{item.group_name}</td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="outline-danger"
                            onClick={() => handleDelete(item.gid)}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="outline-primary"
                            onClick={() => prepareUpdate(item.gid, item.group_name)}
                          >
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">
                      No food groups available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}