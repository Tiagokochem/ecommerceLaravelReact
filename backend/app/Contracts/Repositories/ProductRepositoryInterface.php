<?php

namespace App\Contracts\Repositories;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ProductRepositoryInterface
{
    /**
     * @param  array{category?: int|null, search?: string|null}  $filters
     */
    public function paginateWithFilters(int $perPage, array $filters): LengthAwarePaginator;

    public function findById(int $id): ?Product;

    public function create(array $attributes): Product;

    public function update(Product $product, array $attributes): Product;

    public function delete(Product $product): void;
}
