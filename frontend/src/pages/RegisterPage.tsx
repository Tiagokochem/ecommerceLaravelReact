import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState, type ReactElement } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export function RegisterPage(): ReactElement {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation });
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response.data?.errors) {
        const raw = err.response.data.errors as Record<string, string[]>;
        const next: Record<string, string> = {};
        for (const [k, v] of Object.entries(raw)) {
          next[k] = v[0] ?? '';
        }
        setFieldErrors(next);
      } else {
        setError('Não foi possível cadastrar. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box maxWidth={420} mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Criar conta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Já tem conta? <RouterLink to="/login">Entrar</RouterLink>
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={(e) => void handleSubmit(e)}>
          <Stack spacing={2}>
            <TextField
              label="Nome"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              required
              fullWidth
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
            />
            <TextField
              label="E-mail"
              type="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
              fullWidth
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
            />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              fullWidth
              error={Boolean(fieldErrors.password)}
              helperText={
                fieldErrors.password ?? 'Mín. 8 caracteres, maiúscula, minúscula, número e símbolo.'
              }
            />
            <TextField
              label="Confirmar senha"
              type="password"
              value={passwordConfirmation}
              onChange={(ev) => setPasswordConfirmation(ev.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? 'Cadastrando…' : 'Cadastrar'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
