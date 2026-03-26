<?php

namespace App\Services;

use App\Contracts\Repositories\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function __construct(
        private readonly CategoryRepositoryInterface $categories,
    ) {}

    /**
     * @return Collection<int, Category>
     */
    public function listAll(): Collection
    {
        return $this->categories->allOrderedByName();
    }

    public function create(array $data): Category
    {
        return $this->categories->create($data);
    }

    public function update(int $id, array $data): ?Category
    {
        $category = $this->categories->findById($id);
        if ($category === null) {
            return null;
        }

        return $this->categories->update($category, $data);
    }

    public function delete(int $id): bool
    {
        $category = $this->categories->findById($id);
        if ($category === null) {
            return false;
        }
        $this->categories->delete($category);

        return true;
    }
}
