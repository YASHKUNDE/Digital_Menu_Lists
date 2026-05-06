// Final Updated Code for Qtymast.jsx
import Navb from './Navb';
import axios from 'axios';
import './Menu.css';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';

export default function QTYmast() {
  const [data, setData] = useState([]);
  const [qtyType, setQtyType] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    fetchQty();
  }, []);

  function fetchQty() {
    axios.get("http://localhost:3000/qtymast")
      .then(response => {
        const list = response.data.qtymast || [];
        setData(list);
      })
      .catch(error => {
        console.error("Error fetching quantity types!", error);
      });
  }

  function handleSubmit() {
    if (!qtyType.trim()) {
      alert("Please enter quantity type");
      return;
    }

    const request = isUpdateMode
      ? axios.put("http://localhost:3000/updqtymast", { qty_type: qtyType, qid: selectedId })
      : axios.post("http://localhost:3000/addqtymast", { qty_type: qtyType });

    request
      .then(() => {
        alert(`Quantity type ${isUpdateMode ? 'updated' : 'added'} successfully`);
        fetchQty();
        resetForm();
      })
      .catch(error => {
        console.error("Error submitting quantity type:", error);
        alert("Failed to save quantity type");
      });
  }

  function handleDelete(qid) {
    axios.delete("http://localhost:3000/delqtymast", { data: { qid } })
      .then(response => {
        alert(response.data.message || "Quantity type deleted successfully");
        fetchQty();
      })
      .catch(error => {
        console.error("Error deleting quantity type:", error);
        alert("Failed to delete quantity type");
      });
  }

  function prepareUpdate(val) {
    setQtyType(val.qty_type);
    setSelectedId(val.qid);
    setIsUpdateMode(true);
  }

  function resetForm() {
    setQtyType('');
    setSelectedId(null);
    setIsUpdateMode(false);
  }

  return (
    <div className="app-container">
      <div className="card">
        <div className="card-header">
          <h1>QTY Mast</h1>
          <Navb />
        </div>

        <div className="input-section">
          <input
            type="text"
            className="form-input"
            placeholder="Enter quantity type"
            value={qtyType}
            onChange={(e) => setQtyType(e.target.value)}
          />
          <div className="form-buttons">
          <Button variant={isUpdateMode ? "outline-primary" : "outline-success"} onClick={handleSubmit} className="add-button">
            {isUpdateMode ? "Update" : "Add"}
          </Button>
          {isUpdateMode && <Button variant="outline-secondary" onClick={resetForm}>Cancel</Button>}
          </div>
        </div>

        <div className="table-wrapper">
          <div className="menu-table-wrapper-scrollable">
            <table className="menu-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>QID</th>
                  <th>QTY Type</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((val, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{val.qid}</td>
                      <td>{val.qty_type}</td>
                      <td>{val.created_at}</td>
                      <td>
                        <div className="action-buttons">
                          <Button variant="outline-danger" onClick={() => handleDelete(val.qid)}>Delete</Button>
                          <Button variant="outline-primary" onClick={() => prepareUpdate(val)}>Update</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No quantity records available</td>
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