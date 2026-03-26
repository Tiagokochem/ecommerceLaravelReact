<?php

namespace App\Services;

use App\Contracts\Repositories\ProductRepositoryInterface;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class ProductService
{
    private const int MAX_PER_PAGE = 100;

    public function __construct(
        private readonly ProductRepositoryInterface $products,
    ) {}

    public function paginateFromRequest(Request $request): LengthAwarePaginator
    {
        $perPage = min(max((int) $request->query('per_page', 15), 1), self::MAX_PER_PAGE);

        return $this->products->paginateWithFilters($perPage, [
            'category' => $request->query('category'),
            'search' => $request->query('search'),
        ]);
    }

    public function findById(int $id): ?Product
    {
        return $this->products->findById($id);
    }

    public function create(array $data): Product
    {
        return $this->products->create($data);
    }

    public function update(int $id, array $data): ?Product
    {
        $product = $this->products->findById($id);
        if ($product === null) {
            return null;
        }

        return $this->products->update($product, $data);
    }

    public function delete(int $id): bool
    {
        $product = $this->products->findById($id);
        if ($product === null) {
            return false;
        }
        $this->products->delete($product);

        return true;
    }
}
