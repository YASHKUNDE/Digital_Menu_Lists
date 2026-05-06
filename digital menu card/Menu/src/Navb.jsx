import './Navb.css';
import { Navbar, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function Navb() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'c active' : 'c';

  return (
    <Navbar className='Navbar'>
      <Navbar.Brand className={isActive('/')} as={Link} to="/">Home</Navbar.Brand>
      <Nav className="me-auto">
        <Nav.Link className={isActive('/Menucard')} as={Link} to="/Menucard">Menu Card</Nav.Link>
        <Nav.Link className={isActive('/Menumast')} as={Link} to="/Menumast">Menu Mast</Nav.Link>
        <Nav.Link className={isActive('/Foodgroup')} as={Link} to="/Foodgroup">Food Group</Nav.Link>
        <Nav.Link className={isActive('/QTYmast')} as={Link} to="/QTYmast">QTY Mast</Nav.Link>
        <Nav.Link className={isActive('/OrderList')} as={Link} to="/OrderList">Order List</Nav.Link>
      </Nav>
    </Navbar>
  );
}

export default Navb;
