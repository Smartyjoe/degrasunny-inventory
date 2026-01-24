<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'business_name' => 'Admin Trading Co.',
            'role' => 'admin',
        ]);

        // Create trader user (matches frontend mock data)
        User::create([
            'name' => 'John Trader',
            'email' => 'trader@example.com',
            'password' => Hash::make('password'),
            'business_name' => 'John\'s Trading Store',
            'role' => 'trader',
        ]);

        $this->command->info('Users seeded successfully!');
    }
}
