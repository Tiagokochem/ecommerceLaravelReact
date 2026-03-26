import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { useState, type ReactElement, type ReactNode } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AppLayout({ children }: { children: ReactNode }): ReactElement {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout(): Promise<void> {
    await logout();
    navigate('/');
  }

  const nav = (
    <>
      <Button color="inherit" variant="outlined" component={RouterLink} to="/" sx={{ borderColor: 'rgba(255,255,255,0.4)' }}>
        Produtos
      </Button>
      {user ? (
        <>
          <Button
            color="inherit"
            variant="outlined"
            component={RouterLink}
            to="/categories"
            sx={{ borderColor: 'rgba(255,255,255,0.4)' }}
          >
            Categorias
          </Button>
          <Chip label={user.name} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          <Button color="inherit" variant="contained" onClick={handleLogout} disabled={loading}>
            Sair
          </Button>
        </>
      ) : (
        <>
          <Button color="inherit" variant="outlined" component={RouterLink} to="/login" sx={{ borderColor: 'rgba(255,255,255,0.4)' }}>
            Entrar
          </Button>
          <Button color="inherit" variant="contained" component={RouterLink} to="/register">
            Cadastro
          </Button>
        </>
      )}
    </>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2, display: { sm: 'none' } }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            Catálogo
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, alignItems: 'center' }}>{nav}</Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List sx={{ width: 220 }} onClick={() => setDrawerOpen(false)}>
          <ListItemButton component={RouterLink} to="/">
            <ListItemText primary="Catálogo" />
          </ListItemButton>
          {user ? (
            <>
              <ListItemButton component={RouterLink} to="/categories">
                <ListItemText primary="Categorias" />
              </ListItemButton>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Sair" />
              </ListItemButton>
            </>
          ) : (
            <>
              <ListItemButton component={RouterLink} to="/login">
                <ListItemText primary="Entrar" />
              </ListItemButton>
              <ListItemButton component={RouterLink} to="/register">
                <ListItemText primary="Cadastro" />
              </ListItemButton>
            </>
          )}
        </List>
      </Drawer>
      <Box component="main" sx={{ flex: 1, py: 3 }}>
        <Container maxWidth="lg">{children}</Container>
      </Box>
    </Box>
  );
}
