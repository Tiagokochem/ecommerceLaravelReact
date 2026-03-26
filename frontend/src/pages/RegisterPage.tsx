import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const localErrors: Record<string, string> = {};
    if (!name.trim()) localErrors.name = 'Informe seu nome.';
    if (!email.trim()) localErrors.email = 'Informe seu e-mail.';
    if (password.length < 8) localErrors.password = 'Use ao menos 8 caracteres.';
    if (password !== passwordConfirmation) {
      localErrors.password_confirmation = 'As senhas não conferem.';
    }
    if (Object.keys(localErrors).length > 0) {
      setFieldErrors(localErrors);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
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
      <Paper
        sx={{
          p: 4,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 10px 30px rgba(21, 101, 192, 0.18)',
        }}
      >
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
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              fullWidth
              error={Boolean(fieldErrors.password)}
              helperText={
                fieldErrors.password ?? 'Mín. 8 caracteres, maiúscula, minúscula, número e símbolo.'
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirmar senha"
              type={showPasswordConfirmation ? 'text' : 'password'}
              value={passwordConfirmation}
              onChange={(ev) => setPasswordConfirmation(ev.target.value)}
              required
              fullWidth
              error={Boolean(fieldErrors.password_confirmation)}
              helperText={fieldErrors.password_confirmation}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPasswordConfirmation ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPasswordConfirmation((s) => !s)}
                      edge="end"
                      size="small"
                    >
                      {showPasswordConfirmation ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
