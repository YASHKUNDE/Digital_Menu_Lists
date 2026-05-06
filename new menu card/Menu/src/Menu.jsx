import './Menu.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    axios.get("http://localhost:3000/menucard")
      .then(res => {
        if (res.data.status === "200" && res.data.data) {
          setMenuItems(res.data.data);
        } else {
          setOrderStatus(res.data.message || "❌ Menu not available.");
        }
      })
      .catch(err => {
        console.error("Error fetching menu:", err);
        setOrderStatus(err.response?.data?.message || "❌ Failed to load menu.");
      });
  }, []);

  const handleOrder = async (item) => {
    const t = tableNumber.trim();
    if (!t || isNaN(t) || parseInt(t, 10) <= 0) {
      setOrderStatus("⚠️ Enter a valid table number.");
      setTimeout(() => setOrderStatus(''), 3000);
      return;
    }

    const payload = {
      table_number: parseInt(t, 10),
      menu_id: parseInt(item.mid, 10), // ✅ Ensure menu_id is an integer
      quantity: 1,
      ordered_menu_name: item.menu_name,
      ordered_menu_price: parseFloat(item.menu_price),
    };

    console.log("Order payload:", payload);

    try {
      const res = await axios.post("http://localhost:3000/orders", payload);
      setOrderStatus(`✅ ${res.data.message}`);
    } catch (err) {
      console.error("Order failed:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || '❌ Server error.';
      setOrderStatus(errorMessage);
    }

    setTimeout(() => setOrderStatus(''), 3000);
  };

  const filteredItems = menuItems.filter(i =>
    i.menu_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <div className="card">
        <div className="card-header">
          <h1>Menu Cards</h1>
          <Link to="/login"><button className="login-button">Login</button></Link>
        </div>

        <div className="input-section">
          <input
            type="text"
            className="form-input"
            placeholder="Search Menu"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <input
            type="number"
            className="form-input"
            placeholder="Table Number"
            value={tableNumber}
            onChange={e => setTableNumber(e.target.value)}
            min="1"
          />
        </div>

        {orderStatus && (
          <p className={orderStatus.startsWith('✅') ? 'success-message' : 'error-message'}>
            {orderStatus}
          </p>
        )}

<div className="table-wrapper">
          <div className="menu-table-wrapper-scrollable">
            <table className="menu-table">
          <thead>
            <tr><th>#</th><th>Name</th><th>Price</th><th>Group</th><th>Qty Type</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filteredItems.map((item, i) => (
              <tr key={item.mid}>
                <td>{i + 1}</td>
                <td>{item.menu_name}</td>
                <td>₹{parseFloat(item.menu_price).toFixed(2)}</td>
                <td>{item.group_name}</td>
                <td>{item.qty_type}</td>
                <td>
                  <div className="action-buttons">
                  <Button
                    variant="outline-primary"
                    onClick={() => handleOrder(item)}
                    disabled={!tableNumber.trim() || isNaN(parseInt(tableNumber, 10)) || parseInt(tableNumber, 10) <= 0}
                  >
                    Order
                  </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr><td colSpan="6">No matching menu found</td></tr>
            )}
          </tbody>
        </table>
        </div>
        </div>
      </div>
    </div>
  );
}
