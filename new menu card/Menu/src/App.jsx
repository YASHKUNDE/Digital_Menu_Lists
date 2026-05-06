import './App.css'
import Menu from './Menu.jsx';
import { Routes, Route} from 'react-router-dom';
import Login from './Login.jsx';

function App() {

  return (
    <>
    <div className="container">
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      </div>
    </>
  )
}

export default App