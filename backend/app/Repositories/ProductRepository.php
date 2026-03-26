<?php

namespace App\Repositories;

use App\Contracts\Repositories\ProductRepositoryInterface;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductRepository implements ProductRepositoryInterface
{
    public function paginateWithFilters(int $perPage, array $filters): LengthAwarePaginator
    {
        $query = Product::query()->with('category');

        $categoryId = $filters['category'] ?? null;
        if ($categoryId !== null && $categoryId !== '') {
            $query->where('category_id', (int) $categoryId);
        }

        $search = $filters['search'] ?? null;
        if (is_string($search) && $search !== '') {
            $like = '%'.$this->escapeLikeWildcards($search).'%';
            $query->where(function ($q) use ($like): void {
                $q->where('name', 'like', $like)
                    ->orWhere('description', 'like', $like);
            });
        }

        return $query->orderBy('id')->paginate($perPage);
    }

    public function findById(int $id): ?Product
    {
        return Product::query()->with('category')->find($id);
    }

    public function create(array $attributes): Product
    {
        return Product::query()->create($attributes)->load('category');
    }

    public function update(Product $product, array $attributes): Product
    {
        $product->update($attributes);

        return $product->fresh(['category']);
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }

    private function escapeLikeWildcards(string $value): string
    {
        return str_replace(
            ['\\', '%', '_'],
            ['\\\\', '\\%', '\\_'],
            $value
        );
    }
}
