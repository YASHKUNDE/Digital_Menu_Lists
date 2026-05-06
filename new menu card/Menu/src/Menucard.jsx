
import axios from 'axios';
import Navb from './Navb.jsx';
import { useEffect, useState } from 'react';
import './Menu.css';

export default function Menu() {
  const [data, setData] = useState([]);

  useEffect(() => {
    menucard();
  }, []);

  function menucard() {
    axios.get("http://localhost:3000/menucard")
      .then(response => {
        const l = response.data.data || [];
        setData(l);
      })
      .catch(error => {
        console.error("There was an error fetching the menu card!", error);
      });
  }

  return (
    <div className="app-container">
      <div className="card">
        <div className="card-header">
          <h1>Menu Cards</h1>
          <Navb />
        </div>
        <div className="table-wrapper">
          <div className="menu-table-wrapper-scrollable">
            <table className="menu-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Menu Name</th>
                  <th>Menu Price</th>
                  <th>Group Name</th>
                  <th>QTY</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.length > 0 ? (
                  data.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.menu_name}</td>
                      <td>{item.menu_price}</td>
                      <td>{item.group_name}</td>
                      <td>{item.qty_type}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">No menu cards available</td>
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
