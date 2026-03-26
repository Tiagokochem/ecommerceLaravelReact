<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogReadApiTest extends TestCase
{
    use RefreshDatabase;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::query()->create(['name' => 'Test Cat']);

        Product::query()->create([
            'name' => 'Widget',
            'description' => 'A great widget',
            'price' => 10.50,
            'category_id' => $this->category->id,
            'image_url' => 'https://example.com/x.png',
        ]);
    }

    public function test_products_index_returns_paginated_json(): void
    {
        $response = $this->getJson('/api/products');

        $response->assertOk();
        $response->assertJsonStructure(['data', 'links', 'meta']);
    }

    public function test_products_filtered_by_category(): void
    {
        $response = $this->getJson('/api/products?category='.$this->category->id);

        $response->assertOk();
        $this->assertNotEmpty($response->json('data'));
        foreach ($response->json('data') as $row) {
            $this->assertSame($this->category->id, $row['category_id']);
        }
    }

    public function test_products_search_by_name_or_description(): void
    {
        $response = $this->getJson('/api/products?search=Widget');

        $response->assertOk();
        $response->assertJsonFragment(['name' => 'Widget']);
    }

    public function test_product_show_returns_resource(): void
    {
        $id = Product::query()->firstOrFail()->id;

        $response = $this->getJson('/api/products/'.$id);

        $response->assertOk();
        $response->assertJsonStructure(['data' => ['id', 'name', 'category', 'price']]);
    }

    public function test_product_show_returns_404_for_unknown_id(): void
    {
        $response = $this->getJson('/api/products/99999');

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Produto não encontrado.']);
    }

    public function test_categories_index_returns_collection(): void
    {
        $response = $this->getJson('/api/categories');

        $response->assertOk();
        $response->assertJsonStructure(['data']);
        $response->assertJsonFragment(['name' => 'Test Cat']);
    }
}
