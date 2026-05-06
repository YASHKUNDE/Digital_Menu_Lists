import './Menu.css';
import Navb from './Navb';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';

export default function OrderList() {
  const [allOrders, setAllOrders] = useState({});
  const [selectedTable, setSelectedTable] = useState('');
  const [tableOrders, setTableOrders] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (selectedTable) fetchTableOrders(selectedTable);
    else setTableOrders([]);
  }, [selectedTable]);

  const fetchAllOrders = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:3000/allorders");
      if (res.data?.status === "200" && res.data.data) {
        setAllOrders(res.data.data);
        setStatusMessage('');
      } else {
        setAllOrders({});
        setStatusMessage(res.data?.message || "No active orders found.");
      }
    } catch (err) {
      console.error("Fetch all orders error:", err);
      setStatusMessage("❌ Server error fetching all orders.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableOrders = async (tableNum) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/orders/${tableNum}`);
      if (res.data?.status === "200" && res.data.data) {
        setTableOrders(res.data.data);
        setStatusMessage('');
      } else {
        setTableOrders([]);
        setStatusMessage(res.data?.message || `No orders for Table ${tableNum}.`);
      }
    } catch (err) {
      console.error(`Fetch orders for table ${tableNum} error:`, err);
      setTableOrders([]);
      setStatusMessage("❌ Server error fetching table orders.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBill = async (tableNum) => {
    if (!window.confirm(`Generate bill for Table ${tableNum}?`)) return;
    try {
      const res = await axios.put(`http://localhost:3000/orders/bill/${tableNum}`);
      if (res.data?.status === "200") {
        setStatusMessage(`✅ ${res.data.message}`);
        fetchAllOrders();
        if (selectedTable === tableNum) fetchTableOrders(tableNum);
      } else {
        setStatusMessage(`❌ ${res.data?.message || "Failed to generate bill."}`);
      }
    } catch (err) {
      console.error("Generate bill error:", err);
      setStatusMessage("❌ Server error generating bill.");
    }
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleMarkAsPaid = async (tableNum) => {
    if (!window.confirm(`Mark Table ${tableNum} as paid?`)) return;
    try {
      const res = await axios.put(`http://localhost:3000/orders/paid/${tableNum}`);
      if (res.data?.status === "200") {
        setStatusMessage(`✅ Payment successful for Table ${tableNum}.`);
        setSelectedTable('');
        setTableOrders([]);
        fetchAllOrders();
      } else {
        setStatusMessage(`❌ ${res.data?.message || "Failed to mark as paid."}`);
      }
    } catch (err) {
      console.error("Mark as paid error:", err);
      setStatusMessage("❌ Server error processing payment.");
    }
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const calculateTotal = (orders) =>
    orders.reduce((sum, item) => {
      const price = parseFloat(item?.ordered_menu_price || 0);
      return sum + price * item.quantity;
    }, 0).toFixed(2);

  const tableNumbers = Object.keys(allOrders || {}).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="app-container">
      <div className="card">
        <div className="card-header">
          <h1>Order List</h1>
          <Navb />
        </div>

        {statusMessage && (
          <p className={`status-message ${statusMessage.startsWith('✅') ? 'success-message' : 'error-message'}`}>
            {statusMessage}
          </p>
        )}

        {isLoading ? (
          <p className="loading-message">Loading orders...</p>
        ) : (
          <>
            <div className="table-selection-section">
              <h3>View Orders by Table:</h3>
              <select
                className="form-select"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                <option value="">-- Select Table --</option>
                {tableNumbers.map((num) => {
                  const status = allOrders[num]?.[0]?.status?.toUpperCase() || 'PENDING';
                  return (
                    <option key={num} value={num}>
                      Table {num} (Status: {status})
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedTable && tableOrders.length > 0 && (
              <div className="table-wrapper">
                <h3>
                  Orders for Table {selectedTable} ({
                    tableOrders[0]?.status?.toUpperCase() || 'PENDING'})
                </h3>

                <div className="menu-table-wrapper-scrollable">
                  <table className="menu-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableOrders.map((item) => (
                        <tr key={item.order_id}>
                          <td>{item.ordered_menu_name}</td>
                          <td>₹ {parseFloat(item.ordered_menu_price).toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>₹ {(parseFloat(item.ordered_menu_price) * item.quantity).toFixed(2)}</td>
                          <td>{new Date(item.order_time).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="3" className="text-right"><strong>Grand Total:</strong></td>
                        <td colSpan="2"><strong>₹ {calculateTotal(tableOrders)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="table-actions">
                  <Button
                    variant="outline-primary"
                    onClick={() => handleGenerateBill(selectedTable)}
                    disabled={['billed', 'paid'].includes(tableOrders[0]?.status)}
                  >
                    Generate Bill
                  </Button>
                  <Button
                    variant="outline-success"
                    onClick={() => handleMarkAsPaid(selectedTable)}
                    disabled={tableOrders[0]?.status === 'paid'}
                  >
                    Mark as Paid
                  </Button>
                </div>
              </div>
            )}

            {!selectedTable && tableNumbers.length > 0 && (
              <div className="all-tables-overview mt-4">
                <h3 className="active-tables">Active Tables Overview:</h3>
                <div className="card-container">
                  {tableNumbers.map((num) => {
                    const table = allOrders[num];
                    const total = calculateTotal(table);
                    const status = table?.[0]?.status || 'pending';

                    return (
                      <div key={num} className="box-card">
                        <div className="card-content-wrapper">
                          <div className="card-content">
                            <h4>Table No. {num}</h4>
                            <p><strong>Status: </strong> <span className={`status ${status}`}>{status.toUpperCase()}</span></p>
                            <p><strong>Items: </strong> {table.length}</p>
                            <p><strong>Total: </strong> ₹{total}</p>
                          </div>
                          <div className="button-wrapper">
                            <Button
                              variant="outline-light"
                              className="view-button"
                              onClick={() => setSelectedTable(num)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}


            {!selectedTable && tableNumbers.length === 0 && !statusMessage && (
              <div className="no-data-found">No active or billed tables found.</div>
            )}

            {selectedTable && tableOrders.length === 0 && !statusMessage && (
              <div className="no-data-found mt-3">No orders found for Table {selectedTable}.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
