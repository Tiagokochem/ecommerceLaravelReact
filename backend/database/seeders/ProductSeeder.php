<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $eletronicos = Category::query()->where('name', 'Eletrônicos')->first();
        $livros = Category::query()->where('name', 'Livros')->first();

        if (! $eletronicos || ! $livros) {
            return;
        }

        Product::query()->insert([
            [
                'name' => 'Fones Bluetooth',
                'description' => 'Fones com cancelamento de ruído.',
                'price' => 199.90,
                'category_id' => $eletronicos->id,
                'image_url' => 'https://placehold.co/400x300?text=Fones',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Carregador USB-C',
                'description' => 'Carregador rápido 30W.',
                'price' => 89.00,
                'category_id' => $eletronicos->id,
                'image_url' => 'https://placehold.co/400x300?text=USB-C',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Laravel na Prática',
                'description' => 'Guia de desenvolvimento com Laravel.',
                'price' => 79.90,
                'category_id' => $livros->id,
                'image_url' => 'https://placehold.co/400x300?text=Laravel',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Clean Code',
                'description' => 'Boas práticas de código limpo.',
                'price' => 99.00,
                'category_id' => $livros->id,
                'image_url' => 'https://placehold.co/400x300?text=Clean+Code',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
