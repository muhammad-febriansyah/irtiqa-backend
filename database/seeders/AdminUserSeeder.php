<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin role if not exists
        $adminRole = \App\Models\Role::firstOrCreate(
            ['name' => 'admin'],
            [
                'display_name' => 'Administrator',
                'description' => 'Administrator with full access',
            ]
        );

        // Create admin user
        $adminUser = \App\Models\User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role to user
        if (!$adminUser->hasRole('admin')) {
            $adminUser->roles()->attach($adminRole);
        }

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@admin.com');
        $this->command->info('Password: password');
    }
}
