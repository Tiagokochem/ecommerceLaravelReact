import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import axios from 'axios';
import { fetchProduct } from '../api/products';
import type { Product } from '../types';

function formatBrl(value: string): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
}

export function ProductDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pid = Number(id);
    if (!Number.isFinite(pid)) {
      setError('ID inválido.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchProduct(pid)
      .then((p) => {
        if (!cancelled) {
          setProduct(p);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            setError('Produto não encontrado.');
          } else {
            setError('Erro ao carregar o produto.');
          }
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
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Stack spacing={2}>
        <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />}>
          Voltar ao catálogo
        </Button>
        <Alert severity="error">{error ?? 'Produto não encontrado.'}</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Button component={RouterLink} to="/" startIcon={<ArrowBackIcon />} sx={{ alignSelf: 'flex-start' }}>
        Voltar
      </Button>
      <Card variant="outlined" sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <CardMedia
          component="img"
          sx={{ width: { md: 400 }, objectFit: 'cover', maxHeight: 360 }}
          image={product.image_url ?? 'https://placehold.co/600x400?text=Sem+imagem'}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Sem+imagem';
          }}
        />
        <Box sx={{ p: 3, flex: 1 }}>
          <Typography variant="overline" color="text.secondary">
            {product.category?.name}
          </Typography>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.name}
          </Typography>
          <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>
            {formatBrl(product.price)}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {product.description ?? 'Sem descrição.'}
          </Typography>
        </Box>
      </Card>
    </Stack>
  );
}
