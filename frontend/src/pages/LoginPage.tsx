import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Alert, Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const localErrors: Record<string, string> = {};
    if (!email.trim()) localErrors.email = 'Informe seu e-mail.';
    if (!password.trim()) localErrors.password = 'Informe sua senha.';
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          setError('E-mail ou senha incorretos.');
          return;
        }

        if (err.response.status === 422 && err.response.data?.errors) {
          const raw = err.response.data.errors as Record<string, string[]>;
          setFieldErrors({
            email: raw.email?.[0] ?? '',
            password: raw.password?.[0] ?? '',
          });
          return;
        }
      } else {
        setError('Não foi possível entrar. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box maxWidth={420} mx="auto">
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 30px rgba(21, 101, 192, 0.18)',
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight={700}>
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
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email}
            />
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              fullWidth
              autoComplete="current-password"
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
