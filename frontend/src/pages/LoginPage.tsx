import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState, type ReactElement } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export function LoginPage(): ReactElement {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box maxWidth={420} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Entrar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Não tem conta? <RouterLink to="/register">Cadastre-se</RouterLink>
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={(e) => void handleSubmit(e)}>
          <Stack spacing={2}>
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              fullWidth
              autoComplete="current-password"
            />
            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
