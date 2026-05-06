import { useState } from 'react';
import axios from 'axios';
import './Login.css';

export default function MobileLogin() {
  const [mobile, setMobile] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleMobileLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const mobileNumber = mobile.trim();

    if (!mobileNumber) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }

    if (mobileNumber.length !== 10) {
      setErrorMsg('Please enter a 10-digit mobile number.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/mobileid', { id: mobileNumber });
      const data = response.data;

      if (data.status === '200') {
        const userName = data.data[0].name;
        localStorage.setItem('username', userName);
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'home.html';
      } else {
        setErrorMsg('Login Failed: ' + data.message);
      }
    } catch (error) {
      console.error('Server error:', error);
      setErrorMsg('Server error occurred during login.');
    }
  };

  return (
    <div className="mobile-body">
      <div className="container">
        <div className="login">
          <h2>Welcome</h2>
          <form onSubmit={handleMobileLogin}>
            <input
              type="text"
              id="mobile"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <input className="button" type="submit" value="Login" />
            <div className="error-message">{errorMsg}</div>
          </form>
        </div>
      </div>

      <div className="wave-wrapper">
        <div className="wave"></div>
      </div>
    </div>
  );
}
