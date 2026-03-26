<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CatalogAuthApiTest extends TestCase
{
    use RefreshDatabase;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::query()->create(['name' => 'Seed Cat']);

        Product::query()->create([
            'name' => 'Seed Product',
            'description' => 'x',
            'price' => 1.00,
            'category_id' => $this->category->id,
            'image_url' => null,
        ]);
    }

    public function test_register_returns_token_and_user(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Novo Usuário',
            'email' => 'novo@test.com',
            'password' => 'Str0ng!Senha',
            'password_confirmation' => 'Str0ng!Senha',
        ]);

        $response->assertCreated();
        $response->assertJsonStructure(['data' => ['token', 'token_type', 'user']]);
        $this->assertSame('Bearer', $response->json('data.token_type'));
        $this->assertDatabaseHas('users', ['email' => 'novo@test.com']);
    }

    public function test_register_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'dup@test.com']);

        $response = $this->postJson('/api/register', [
            'name' => 'Outro',
            'email' => 'dup@test.com',
            'password' => 'Str0ng!Senha',
            'password_confirmation' => 'Str0ng!Senha',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_register_rejects_weak_password(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Novo Usuário',
            'email' => 'fraco@test.com',
            'password' => 'short',
            'password_confirmation' => 'short',
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['password']);
    }

    public function test_login_returns_token_for_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'login@test.com',
            'password' => Hash::make('Str0ng!Senha'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@test.com',
            'password' => 'Str0ng!Senha',
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['data' => ['token', 'token_type', 'user']]);
    }

    public function test_login_returns_401_for_invalid_credentials(): void
    {
        User::factory()->create([
            'email' => 'bad@test.com',
            'password' => Hash::make('Str0ng!Senha'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'bad@test.com',
            'password' => 'WrongPass1!',
        ]);

        $response->assertStatus(401);
        $response->assertJson(['message' => 'Credenciais inválidas.']);
    }

    public function test_mutations_require_authentication(): void
    {
        $this->postJson('/api/products', [])->assertUnauthorized();
        $this->putJson('/api/products/1', [])->assertUnauthorized();
        $this->deleteJson('/api/products/1')->assertUnauthorized();
        $this->postJson('/api/categories', [])->assertUnauthorized();
        $this->putJson('/api/categories/1', [])->assertUnauthorized();
        $this->deleteJson('/api/categories/1')->assertUnauthorized();
    }

    public function test_authenticated_user_can_create_product(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('t')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/products', [
            'name' => 'Novo Produto',
            'description' => 'desc',
            'price' => 42.50,
            'category_id' => $this->category->id,
            'image_url' => 'https://example.com/a.png',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('products', ['name' => 'Novo Produto']);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('t')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/logout');

        $response->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
