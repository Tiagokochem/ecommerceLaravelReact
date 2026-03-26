<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreCategoryRequest;
use App\Http\Requests\Api\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection($this->categoryService->listAll());
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->categoryService->create($request->validated());

        return CategoryResource::make($category)
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateCategoryRequest $request, int $id): CategoryResource|JsonResponse
    {
        $category = $this->categoryService->update($id, $request->validated());

        if ($category === null) {
            return response()->json([
                'message' => 'Categoria não encontrada.',
            ], 404);
        }

        return CategoryResource::make($category);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->categoryService->delete($id);

        if (! $deleted) {
            return response()->json([
                'message' => 'Categoria não encontrada.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'message' => 'Categoria removida.',
            ],
        ]);
    }
}
