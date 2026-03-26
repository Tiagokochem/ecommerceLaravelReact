import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState, type ReactElement } from 'react';
import axios from 'axios';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../api/categories';
import { useAuth } from '../context/AuthContext';
import type { Category } from '../types';

type FieldErrors = Record<string, string>;

export function CategoriesPage(): ReactElement {
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createSaving, setCreateSaving] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [createErrors, setCreateErrors] = useState<FieldErrors>({});

  const [editOpen, setEditOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState<string | null>(null);
  const [editErrors, setEditErrors] = useState<FieldErrors>({});

  const isAuthed = useMemo(() => Boolean(user), [user]);

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchCategories();
      setCategories(list);
    } catch {
      setError('Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openEdit(category: Category): void {
    setEditCategoryId(category.id);
    setEditName(category.name);
    setEditMsg(null);
    setEditErrors({});
    setEditOpen(true);
  }

  async function handleCreate(): Promise<void> {
    const localErrors: FieldErrors = {};
    if (!createName.trim()) localErrors.name = 'Informe o nome da categoria.';

    setCreateErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    setCreateSaving(true);
    setCreateMsg(null);
    try {
      await createCategory(createName.trim());
      setCreateMsg('Categoria criada.');
      setCreateName('');
      await load();
      setCreateOpen(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response.data?.errors) {
        const raw = err.response.data.errors as Record<string, string[]>;
        setCreateErrors({ name: raw.name?.[0] ?? '' });
        setCreateMsg(null);
      } else {
        setCreateMsg('Falha ao criar categoria.');
      }
    } finally {
      setCreateSaving(false);
    }
  }

  async function handleUpdate(): Promise<void> {
    if (editCategoryId === null) return;

    const localErrors: FieldErrors = {};
    if (!editName.trim()) localErrors.name = 'Informe o nome da categoria.';

    setEditErrors(localErrors);
    if (Object.keys(localErrors).length > 0) return;

    setEditSaving(true);
    setEditMsg(null);
    try {
      await updateCategory(editCategoryId, editName.trim());
      setEditMsg('Categoria atualizada.');
      await load();
      setEditOpen(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response.data?.errors) {
        const raw = err.response.data.errors as Record<string, string[]>;
        setEditErrors({ name: raw.name?.[0] ?? '' });
        setEditMsg(null);
      } else {
        setEditMsg('Falha ao atualizar categoria.');
      }
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete(id: number): Promise<void> {
    const ok = window.confirm('Tem certeza que deseja remover esta categoria?');
    if (!ok) return;

    try {
      await deleteCategory(id);
      await load();
    } catch {
      window.alert('Falha ao remover categoria.');
    }
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1565c0 0%, #6a1b9a 100%)',
          boxShadow: '0 10px 30px rgba(21, 101, 192, 0.25)',
          color: 'white',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.9 }}>
          Admin
        </Typography>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Categorias
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.92 }}>
          Edite nomes e visualize o que está cadastrado no catálogo.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6">Lista de categorias</Typography>
          {isAuthed ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Nova categoria
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Faça login para editar/excluir.
            </Typography>
          )}
        </Stack>

        {loading ? (
          <Typography color="text.secondary">Carregando...</Typography>
        ) : categories.length === 0 ? (
          <Typography color="text.secondary">Nenhuma categoria cadastrada.</Typography>
        ) : (
          <List disablePadding>
            {categories.map((c) => (
              <ListItem key={c.id} divider disableGutters sx={{ borderRadius: 2, mb: 1 }}>
                <ListItemText primary={c.name} secondary={`#${c.id}`} />
                {isAuthed && (
                  <ListItemSecondaryAction>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        aria-label="Editar categoria"
                        onClick={() => openEdit(c)}
                        size="small"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        aria-label="Excluir categoria"
                        onClick={() => void handleDelete(c.id)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova categoria</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Nome"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              error={Boolean(createErrors.name)}
              helperText={createErrors.name}
              fullWidth
              required
            />
            {createMsg && (
              <Alert severity={createMsg.includes('Falha') ? 'error' : 'success'}>{createMsg}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancelar</Button>
          <Button onClick={() => void handleCreate()} disabled={createSaving} variant="contained">
            {createSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar categoria</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Nome"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              error={Boolean(editErrors.name)}
              helperText={editErrors.name}
              fullWidth
              required
            />
            {editMsg && <Alert severity={editMsg.includes('Falha') ? 'error' : 'success'}>{editMsg}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button onClick={() => void handleUpdate()} disabled={editSaving} variant="contained">
            {editSaving ? 'Atualizando...' : 'Salvar alterações'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

