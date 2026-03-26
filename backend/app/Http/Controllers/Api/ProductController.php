<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreProductRequest;
use App\Http\Requests\Api\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return ProductResource::collection(
            $this->productService->paginateFromRequest($request)
        );
    }

    public function show(int $id): ProductResource|JsonResponse
    {
        $product = $this->productService->findById($id);

        if ($product === null) {
            return response()->json([
                'message' => 'Produto não encontrado.',
            ], 404);
        }

        return ProductResource::make($product);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->create($request->validated());

        return ProductResource::make($product)
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateProductRequest $request, int $id): ProductResource|JsonResponse
    {
        $product = $this->productService->update($id, $request->validated());

        if ($product === null) {
            return response()->json([
                'message' => 'Produto não encontrado.',
            ], 404);
        }

        return ProductResource::make($product);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->productService->delete($id);

        if (! $deleted) {
            return response()->json([
                'message' => 'Produto não encontrado.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'message' => 'Produto removido.',
            ],
        ]);
    }
}
