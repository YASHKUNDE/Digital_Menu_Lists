import Navb from './Navb.jsx';
import axios from 'axios';
import './Menu.css';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';

export default function Menumast() {
  const [data, setData] = useState([]);
  const [menuName, setMenuName] = useState('');
  const [menuPrice, setMenuPrice] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [gid, setGid] = useState(1);
  const [qid, setQid] = useState(1);

  useEffect(() => {
    fetchMenu();
  }, []);

  function fetchMenu() {
    axios.get("http://localhost:3000/menu")
      .then(response => {
        const list = response.data.Menu_List || [];
        setData(list);
      })
      .catch(error => {
        console.error("Error fetching menu list!", error);
      });
  }

  function handleSubmit() {
    if (!menuName || !menuPrice) {
      alert("Please enter both menu name and price.");
      return;
    }

    const payload = { menu_name: menuName, menu_price: Number(menuPrice), gid, qid };

    const request = selectedId
      ? axios.put("http://localhost:3000/updmenu", { ...payload, mid: selectedId })
      : axios.post("http://localhost:3000/addmenu", payload);

    request
      .then((res) => {
        alert(res.data.message || "Saved successfully.");
        fetchMenu();
        resetForm();
      })
      .catch(error => {
        console.error("Error saving menu item:", error);
        alert("Save failed.");
      });
  }

  function handleDelete(id) {
    axios.delete("http://localhost:3000/delmenu", {
      data: { mid: id }
    })
      .then(response => {
        alert(response.data.message || "Menu item deleted.");
        fetchMenu();
      })
      .catch(error => {
        console.error("Error deleting menu item:", error);
        alert("Delete failed.");
      });
  }

  function prepareUpdate(item) {
    setMenuName(item.menu_name);
    setMenuPrice(item.menu_price);
    setSelectedId(item.mid);
    setGid(item.gid || 1);
    setQid(item.qid || 1);
  }

  function resetForm() {
    setMenuName('');
    setMenuPrice('');
    setSelectedId(null);
    setGid(1);
    setQid(1);
  }

  return (
    <div className="app-container">
      <div className="card">
        <div className="card-header">
          <h1>Menu Mast</h1>
          <Navb />
        </div>

        <div className="input-section">
          <input
            type="text"
            className="form-input"
            placeholder="Enter menu name"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
          />
          <input
            type="number"
            className="form-input"
            placeholder="Enter price"
            value={menuPrice}
            onChange={(e) => setMenuPrice(e.target.value)}
          />
          <input
            type="number"
            className="form-input"
            placeholder="Group ID"
            value={gid}
            onChange={(e) => setGid(e.target.value)}
          />
          <input
            type="number"
            className="form-input"
            placeholder="Qty ID"
            value={qid}
            onChange={(e) => setQid(e.target.value)}
          />
          <div className="form-buttons">
          <Button
            variant={selectedId ? "outline-primary" : "outline-success"}
            onClick={handleSubmit}
          >
            {selectedId ? "Update" : "Add"}
          </Button>
          {selectedId && (
            <Button variant="outline-secondary" onClick={resetForm}>
              Cancel
            </Button>
          )}
          </div>
        </div>

        <div className="table-wrapper">
          <div className="menu-table-wrapper-scrollable">
            <table className="menu-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Menu Name</th>
                  <th>Menu Price</th>
                  <th>GID</th>
                  <th>QID</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((val, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{val.menu_name}</td>
                      <td>{val.menu_price}</td>
                      <td>{val.gid}</td>
                      <td>{val.qid}</td>
                      <td>{val.created_at}</td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="outline-danger"
                            onClick={() => handleDelete(val.mid)}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="outline-primary"
                            onClick={() => prepareUpdate(val)}
                          >
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No menu cards available
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
