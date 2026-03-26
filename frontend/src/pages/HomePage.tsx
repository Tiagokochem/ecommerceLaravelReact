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
  Chip,
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
import axios from 'axios';
import { createCategory, fetchCategories } from '../api/categories';
import { createProduct, fetchProducts } from '../api/products';
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
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [productSaving, setProductSaving] = useState(false);
  const [productMsg, setProductMsg] = useState<string | null>(null);
  const [productFieldErrors, setProductFieldErrors] = useState<Record<string, string>>({});
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image_url: '',
  });

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
      setCatMsg('Informe o nome da categoria.');
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

  async function handleCreateProduct(): Promise<void> {
    const payload = {
      name: newProduct.name.trim(),
      description: newProduct.description.trim() || undefined,
      price: Number(newProduct.price),
      category_id: Number(newProduct.category_id),
      image_url: newProduct.image_url.trim() || undefined,
    };

    const localErrors: Record<string, string> = {};
    if (!payload.name) localErrors.name = 'Informe o nome do produto.';
    if (!Number.isFinite(payload.price) || payload.price <= 0) {
      localErrors.price = 'Informe um preço válido maior que zero.';
    }
    if (!Number.isInteger(payload.category_id) || payload.category_id <= 0) {
      localErrors.category_id = 'Selecione uma categoria.';
    }

    setProductFieldErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      return;
    }

    setProductSaving(true);
    setProductMsg(null);
    try {
      await createProduct(payload);
      setProductMsg('Produto criado com sucesso.');
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
      });
      setPage(1);
      setCategoryId('');
      const refreshed = await fetchProducts({ page: 1, perPage: 12, search: debouncedSearch });
      setProducts(refreshed.data);
      setMeta(refreshed.meta);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 422 && err.response.data?.errors) {
        const raw = err.response.data.errors as Record<string, string[]>;
        const next: Record<string, string> = {};
        for (const [k, v] of Object.entries(raw)) {
          next[k] = v[0] ?? '';
        }
        setProductFieldErrors(next);
      } else {
        setProductMsg('Falha ao criar produto.');
      }
    } finally {
      setProductSaving(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          color: 'white',
          background: 'linear-gradient(135deg, #1565c0 0%, #6a1b9a 100%)',
          boxShadow: '0 10px 30px rgba(21, 101, 192, 0.25)',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.85 }}>
          Coleção da semana
        </Typography>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Encontre o produto ideal
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.92, maxWidth: 700 }}>
          Busque por nome, filtre por categoria e confira os detalhes antes de comprar.
        </Typography>
      </Box>

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
          <>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setProductMsg(null);
                setProductFieldErrors({});
                setProductDialogOpen(true);
              }}
            >
              Novo produto
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setCatMsg(null);
                setCatDialogOpen(true);
              }}
            >
              Nova categoria
            </Button>
          </>
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {meta.total} produto(s) encontrado(s)
      </Typography>

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

      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Novo produto (autenticado)</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Nome"
              value={newProduct.name}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
              error={Boolean(productFieldErrors.name)}
              helperText={productFieldErrors.name}
              fullWidth
              required
            />
            <TextField
              label="Descrição"
              value={newProduct.description}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
              multiline
              minRows={2}
              fullWidth
            />
            <TextField
              label="Preço"
              type="number"
              inputProps={{ min: 0.01, step: 0.01 }}
              value={newProduct.price}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
              error={Boolean(productFieldErrors.price)}
              helperText={productFieldErrors.price}
              fullWidth
              required
            />
            <FormControl fullWidth error={Boolean(productFieldErrors.category_id)}>
              <InputLabel id="new-product-cat-label">Categoria</InputLabel>
              <Select
                labelId="new-product-cat-label"
                label="Categoria"
                value={newProduct.category_id}
                onChange={(e) =>
                  setNewProduct((prev) => ({ ...prev, category_id: String(e.target.value) }))
                }
              >
                {categories.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
              {productFieldErrors.category_id && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {productFieldErrors.category_id}
                </Typography>
              )}
            </FormControl>
            <TextField
              label="URL da imagem (opcional)"
              value={newProduct.image_url}
              onChange={(e) => setNewProduct((prev) => ({ ...prev, image_url: e.target.value }))}
              error={Boolean(productFieldErrors.image_url)}
              helperText={productFieldErrors.image_url}
              fullWidth
            />
            {productMsg && (
              <Alert severity={productMsg.includes('Falha') ? 'error' : 'success'}>{productMsg}</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Fechar</Button>
          <Button onClick={() => void handleCreateProduct()} disabled={productSaving} variant="contained">
            {productSaving ? 'Salvando...' : 'Salvar produto'}
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
              <Card
                key={p.id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  transition: 'transform .2s ease, box-shadow .2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
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
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {p.category?.name}
                      </Typography>
                      <Chip size="small" color="primary" variant="outlined" label="Ver detalhe" />
                    </Stack>
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
