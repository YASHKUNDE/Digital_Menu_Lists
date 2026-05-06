import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import Menu from './Menu.jsx';
import Foodgroup from './Foodgroup.jsx';
import QTYmast from './Qtymast.jsx';
import Menumast from './Menumast.jsx';
import Navb from './Navb.jsx';
import Login from './Login.jsx';
import Menucard from './Menucard.jsx';
import Register from './Register.jsx'
import OrderList from './OrderList.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/navb" element={<Navb />} />
        <Route path="/menucard" element={<Menucard />} />
        <Route path="/foodgroup" element={<Foodgroup />} />
        <Route path="/qtymast" element={<QTYmast />} />
        <Route path="/menumast" element={<Menumast />} />
        <Route path="/OrderList" element={<OrderList />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
