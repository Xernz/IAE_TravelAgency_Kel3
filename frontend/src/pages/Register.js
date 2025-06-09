import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../services/graphqlUserHooks';

export default function Register() {
// Updated for new user schema: full_name, email, password, phone_number, birth_date, no_nik

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [noNIK, setNoNIK] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [registerMutation, { loading: registering }] = useRegister();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const form = { email, password, full_name: fullName, phone_number: phoneNumber, birth_date: birthDate, no_nik: noNIK };
      const { data } = await registerMutation({ variables: { input: form } });
      if (data.register.status === 'success') {
        localStorage.setItem('user', JSON.stringify(data.register.user));
        if (data.register.token) {
          localStorage.setItem('token', data.register.token);
        }
        setSuccess('Registration successful! Please login.');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setError(data.register.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={6}>
      <Typography variant="h5" mb={2}>Register</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} fullWidth margin="normal" />
        <TextField label="Birth Date" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
        <TextField label="No NIK" value={noNIK} onChange={e => setNoNIK(e.target.value)} fullWidth margin="normal" required />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Register</Button>
      </form>
      <Button onClick={() => navigate('/login')} sx={{ mt: 2 }}>Already have an account? Login</Button>
    </Box>
  );
}
