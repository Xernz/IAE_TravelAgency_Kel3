import React, { useState, useContext } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_BOOKINGS, CANCEL_BOOKING, MODIFY_BOOKING, INITIATE_PAYMENT } from '../services/graphqlQueries';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { SnackbarContext } from '../App';

export default function MyBookings() {
  const { loading, error, data, refetch } = useQuery(GET_MY_BOOKINGS);
  const [cancelBooking] = useMutation(CANCEL_BOOKING);
  const [modifyBooking] = useMutation(MODIFY_BOOKING);
  const [initiatePayment, { loading: payLoading }] = useMutation(INITIATE_PAYMENT);
  const { showSnackbar } = React.useContext(SnackbarContext);

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking({ variables: { id: bookingId } });
      showSnackbar('Pemesanan berhasil dibatalkan!', 'success');
    } catch (err) {
      showSnackbar('Gagal membatalkan pemesanan: ' + (err.message || 'Terjadi kesalahan'), 'error');
    }
  };

  const handleModify = async (bookingId, newData) => {
    try {
      await modifyBooking({ variables: { id: bookingId, input: newData } });
      showSnackbar('Pemesanan berhasil diubah!', 'success');
    } catch (err) {
      showSnackbar('Gagal mengubah pemesanan: ' + (err.message || 'Terjadi kesalahan'), 'error');
    }
  };

  if (loading) return <Typography>Memuat daftar pemesanan...</Typography>;
  if (error) return <Typography color="error">Gagal memuat pemesanan: {error.message}</Typography>;

  // Payment dialog state
  const [openPay, setOpenPay] = React.useState(false);
  const [payBooking, setPayBooking] = React.useState(null);
  const [payMethod, setPayMethod] = React.useState('credit_card');
  const [payAmount, setPayAmount] = React.useState('');

  const handleOpenPay = (booking) => {
    setPayBooking(booking);
    setPayAmount(booking.amount_due || '');
    setOpenPay(true);
  };

  const handlePay = async () => {
    if (!payBooking) return;
    try {
      await initiatePayment({
        variables: {
          userId: payBooking.user_id,
          bookingId: payBooking.id,
          amount: parseFloat(payAmount),
          method: payMethod
        }
      });
      showSnackbar('Pembayaran berhasil!', 'success');
      setOpenPay(false);
      refetch();
    } catch (err) {
      showSnackbar('Gagal melakukan pembayaran: ' + (err.message || 'Terjadi kesalahan'), 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h5" mb={2} align="center">Daftar Pemesanan Saya</Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data && data.myBookings && data.myBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>
                  <Button onClick={() => handleCancel(booking.id)} color="error" variant="outlined" size="small" sx={{ mr: 1 }}>
                    Batalkan
                  </Button>
                  <Button onClick={() => handleOpenPay(booking)} color="primary" variant="contained" size="small">
                    Bayar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Payment Dialog */}
      <Dialog open={openPay} onClose={() => setOpenPay(false)}>
        <DialogTitle>Pembayaran</DialogTitle>
        <DialogContent>
          <Typography>Booking ID: {payBooking?.id}</Typography>
          <Typography>Status: {payBooking?.status}</Typography>
          <Box mt={2}>
            <TextField
              label="Jumlah"
              type="number"
              value={payAmount}
              onChange={e => setPayAmount(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Metode Pembayaran"
              value={payMethod}
              onChange={e => setPayMethod(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPay(false)}>Batal</Button>
          <Button onClick={handlePay} disabled={payLoading} variant="contained" color="primary">
            {payLoading ? <CircularProgress size={24} /> : 'Bayar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

  const [success, setSuccess] = useState('');

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking({ variables: { id: bookingId } });
      setSuccess('Booking cancelled successfully.');
    } catch (err) {
      setSuccess('Failed to cancel booking');
    }
  };

  // Modification dialog state
  const [openModify, setOpenModify] = useState(false);
  const [modifyItems, setModifyItems] = useState([]);
  const [modBookingId, setModBookingId] = useState(null);
  const [modLoading, setModLoading] = useState(false);

  const handleModifyItemChange = (idx, field, value) => {
    setModifyItems(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleModify = async () => {
    setModLoading(true);
    setError('');
    setSuccess('');
    try {
      await modifyBooking({ variables: { id: modBookingId, input: modifyItems } });
      setSuccess('Booking modified successfully.');
      setOpenModify(false);
    } catch (err) {
      setError('Failed to modify booking');
    } finally {
      setModLoading(false);
    }
  };

  const handleOpenPay = (booking) => {
    setPayBooking(booking);
    setPayAmount('100.00'); // Placeholder, should be calculated based on booking
    setPayMethod('credit_card');
    setOpenPay(true);
  };

  const handlePay = async () => {
    setPayLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await initiatePayment({
        variables: {
          userId: user.id,
          bookingId: payBooking.id,
          amount: parseFloat(payAmount),
          method: payMethod
        }
      });
      if (data && data.initiatePayment && data.initiatePayment.status === 'success') {
        setSuccess('Pembayaran berhasil dimulai.');
        setOpenPay(false);
        showSnackbar('Pembayaran berhasil dimulai.', 'success');
      } else {
        setError('Gagal memulai pembayaran.');
        showSnackbar('Gagal memulai pembayaran.', 'error');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan atau server.');
      showSnackbar('Terjadi kesalahan jaringan atau server.', 'error');
    } finally {
      setPayLoading(false);
    }
  };


  if (!user) return <Alert severity="warning">You must be logged in to view your bookings.</Alert>;

  return (
    <Box maxWidth={900} mx="auto" mt={6} px={1}>
      <Typography variant="h5" mb={2}>My Bookings</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box> : (
        <TableContainer component={Paper} sx={{ maxHeight: 440, overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center">No bookings found.</TableCell></TableRow>
              ) : bookings.map(b => (
                <TableRow key={b.id}>
                  <TableCell>{b.id}</TableCell>
                  <TableCell>{b.created_at}</TableCell>
                  <TableCell>{b.status || 'active'}</TableCell>
                  <TableCell>
                    {b.items && b.items.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: 16, wordBreak: 'break-word' }}>
                        {b.items.map(item => (
                          <li key={item.id}>{item.type}: {item.ref_id}</li>
                        ))}
                      </ul>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <Button size="small" color="error" disabled={b.status === 'cancelled' || cancelId === b.id} onClick={() => handleCancel(b.id)}>
                      {cancelId === b.id ? <CircularProgress size={18} /> : 'Cancel'}
                    </Button>
                    <Button size="small" sx={{ ml: 1 }} disabled={b.status === 'cancelled'} onClick={() => handleOpenModify(b)}>
                      Modify
                    </Button>
                    {b.status !== 'cancelled' && b.status !== 'paid' && (
                      <Button size="small" sx={{ ml: 1 }} variant="contained" color="success" onClick={() => handleOpenPay(b)}>
                        Pay Now
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {/* Modification Dialog */}
      <Dialog open={openModify} onClose={() => setOpenModify(false)}>
        <DialogTitle>Modify Booking (ID: {modBookingId})</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>Edit booking items below and submit changes.</Typography>
          {modifyItems.map((item, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
              <Typography variant="subtitle2">Item #{idx + 1}</Typography>
              <Box display="flex" gap={1} alignItems="center">
                <label>Type:</label>
                <input value={item.type} onChange={e => handleModifyItemChange(idx, 'type', e.target.value)} style={{ width: 100 }} />
                <label>Ref ID:</label>
                <input value={item.ref_id} onChange={e => handleModifyItemChange(idx, 'ref_id', e.target.value)} style={{ width: 80 }} />
              </Box>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModify(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleModify} disabled={modLoading}>{modLoading ? <CircularProgress size={18} /> : 'Submit'}</Button>
        </DialogActions>
      </Dialog>
      {/* Payment Dialog */}
      <Dialog open={openPay} onClose={() => setOpenPay(false)}>
        <DialogTitle>Pay for Booking (ID: {payBooking && payBooking.id})</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <label>Amount:
              <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ marginLeft: 8 }} />
            </label>
            <label>Method:
              <select value={payMethod} onChange={e => setPayMethod(e.target.value)} style={{ marginLeft: 8 }}>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPay(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePay} disabled={payLoading}>{payLoading ? <CircularProgress size={18} /> : 'Pay'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

