import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { createCategory, fetchCategories } from '../api/categories';
import { fetchProducts } from '../api/products';
import { useAuth } from '../context/AuthContext';
import type { Category, Product } from '../types';

function formatBrl(value: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

export function HomePage(): ReactElement {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 12, total: 0 });
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catSaving, setCatSaving] = useState(false);
  const [catMsg, setCatMsg] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(search), 400);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [categoryId, debouncedSearch]);

  const loadCategories = useCallback(async () => {
    const list = await fetchCategories();
    setCategories(list);
  }, []);

  useEffect(() => {
    void loadCategories().catch(() => {
      /* erro tratado no load products */
    });
  }, [loadCategories]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProducts({
      page,
      perPage: 12,
      categoryId: categoryId === '' ? undefined : categoryId,
      search: debouncedSearch,
    })
      .then((res) => {
        if (!cancelled) {
          setProducts(res.data);
          setMeta(res.meta);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Não foi possível carregar os produtos. Verifique se a API está no ar.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, categoryId, debouncedSearch]);

  async function handleCreateCategory(): Promise<void> {
    if (!newCatName.trim()) {
      return;
    }
    setCatSaving(true);
    setCatMsg(null);
    try {
      await createCategory(newCatName.trim());
      setCatMsg('Categoria criada.');
      setNewCatName('');
      await loadCategories();
    } catch {
      setCatMsg('Falha ao criar categoria.');
    } finally {
      setCatSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1">
        Produtos
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <TextField
          placeholder="Buscar por nome ou descrição"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel id="cat-filter">Categoria</InputLabel>
          <Select
            labelId="cat-filter"
            label="Categoria"
            value={categoryId}
            onChange={(e) => {
              const v = e.target.value;
              setCategoryId(v === '' ? '' : Number(v));
            }}
          >
            <MenuItem value="">Todas</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {user && (
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCatDialogOpen(true)}>
            Nova categoria
          </Button>
        )}
      </Stack>

      <Dialog open={catDialogOpen} onClose={() => setCatDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova categoria (autenticado)</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            fullWidth
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
          />
          {catMsg && (
            <Alert severity={catMsg.includes('Falha') ? 'error' : 'success'} sx={{ mt: 2 }}>
              {catMsg}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCatDialogOpen(false)}>Fechar</Button>
          <Button onClick={() => void handleCreateCategory()} disabled={catSaving} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            }}
          >
            {products.map((p) => (
              <Card key={p.id} variant="outlined">
                <CardActionArea component={RouterLink} to={`/products/${p.id}`}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={p.image_url ?? 'https://placehold.co/400x240?text=Sem+imagem'}
                    alt={p.name}
                    sx={{ objectFit: 'cover', bgcolor: 'grey.100' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x240?text=Sem+imagem';
                    }}
                  />
                  <CardContent>
                    <Typography variant="h6" component="h2" noWrap>
                      {p.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} noWrap>
                      {p.description ?? '—'}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {formatBrl(p.price)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.category?.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
          {products.length === 0 && !error && (
            <Typography color="text.secondary">Nenhum produto encontrado.</Typography>
          )}
          {meta.last_page > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                page={meta.current_page}
                count={meta.last_page}
                onChange={(_, v) => setPage(v)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Stack>
  );
}
