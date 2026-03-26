<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::query()->insert([
            ['name' => 'Eletrônicos', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Livros', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
