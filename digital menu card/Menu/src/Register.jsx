import { useState } from 'react';
import axios from 'axios';

export default function RegisterComponent () {
  const [users, setUsers] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [pass, setPass] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleApp = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/reg', {
        users,
        email,
        mobile,
        pass
      });

      if (response.data.status === "200") {
        setMessage(response.data.message);
        setIsSuccess(true);
        // Optional: Clear form
        setUsers('');
        setEmail('');
        setMobile('');
        setPass('');
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || 'Registration failed');
      } else {
        setMessage('Something went wrong');
      }
      setIsSuccess(false);
    }
  };

  return (
    <div className="item">
      <h2>Create An Account</h2>
      <form onSubmit={handleApp}>
        <input type="text" onChange={(e) => setUsers(e.target.value)} value={users} placeholder='Username' name='username' />
        <input type="text" onChange={(e) => setEmail(e.target.value)} value={email} placeholder='Email' name='email' />
        <input type="text" onChange={(e) => setMobile(e.target.value)} value={mobile} placeholder='Mobile' name='mobile' />
        <input type="password" onChange={(e) => setPass(e.target.value)} value={pass} placeholder='Password' name='password' />
        <button type="submit">Sign Up</button>
        {message && (
          <p style={{ color: isSuccess ? 'green' : 'white', marginTop: '10px' }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};
