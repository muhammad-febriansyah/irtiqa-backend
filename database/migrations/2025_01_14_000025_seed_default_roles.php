<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert default roles
        DB::table('roles')->insert([
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full system access, manage users, consultants, content, and all settings',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'kyai',
                'display_name' => 'Kyai / Dewan Pembina',
                'description' => 'Spiritual advisor role for ethics, content curation, and internal fatwa',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'consultant',
                'display_name' => 'Konsultan / Praktisi',
                'description' => 'Provide consultation services, handle tickets, and guide programs',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'client',
                'display_name' => 'Client / User',
                'description' => 'Regular user who can request consultations and participate in programs',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Insert default permissions
        $permissions = [
            // User Management
            ['name' => 'view_users', 'display_name' => 'View Users', 'description' => 'Can view user list', 'group' => 'users'],
            ['name' => 'create_users', 'display_name' => 'Create Users', 'description' => 'Can create new users', 'group' => 'users'],
            ['name' => 'edit_users', 'display_name' => 'Edit Users', 'description' => 'Can edit user information', 'group' => 'users'],
            ['name' => 'delete_users', 'display_name' => 'Delete Users', 'description' => 'Can delete users', 'group' => 'users'],

            // Consultant Management
            ['name' => 'view_consultants', 'display_name' => 'View Consultants', 'description' => 'Can view consultant list', 'group' => 'consultants'],
            ['name' => 'manage_consultants', 'display_name' => 'Manage Consultants', 'description' => 'Can manage consultant profiles and verification', 'group' => 'consultants'],
            ['name' => 'suspend_consultants', 'display_name' => 'Suspend Consultants', 'description' => 'Can suspend/activate consultants', 'group' => 'consultants'],

            // Ticket Management
            ['name' => 'view_all_tickets', 'display_name' => 'View All Tickets', 'description' => 'Can view all consultation tickets', 'group' => 'tickets'],
            ['name' => 'handle_tickets', 'display_name' => 'Handle Tickets', 'description' => 'Can handle assigned consultation tickets', 'group' => 'tickets'],
            ['name' => 'assign_tickets', 'display_name' => 'Assign Tickets', 'description' => 'Can assign tickets to consultants', 'group' => 'tickets'],
            ['name' => 'create_tickets', 'display_name' => 'Create Tickets', 'description' => 'Can create consultation tickets', 'group' => 'tickets'],

            // Payment Management
            ['name' => 'view_transactions', 'display_name' => 'View Transactions', 'description' => 'Can view payment transactions', 'group' => 'payments'],
            ['name' => 'verify_payments', 'display_name' => 'Verify Payments', 'description' => 'Can verify manual transfer payments', 'group' => 'payments'],
            ['name' => 'manage_refunds', 'display_name' => 'Manage Refunds', 'description' => 'Can approve/process refunds', 'group' => 'payments'],

            // Program Management
            ['name' => 'view_programs', 'display_name' => 'View Programs', 'description' => 'Can view guidance programs', 'group' => 'programs'],
            ['name' => 'manage_programs', 'display_name' => 'Manage Programs', 'description' => 'Can manage program sessions and tasks', 'group' => 'programs'],

            // Content Management
            ['name' => 'view_content', 'display_name' => 'View Content', 'description' => 'Can view educational content', 'group' => 'content'],
            ['name' => 'create_content', 'display_name' => 'Create Content', 'description' => 'Can create educational content', 'group' => 'content'],
            ['name' => 'edit_content', 'display_name' => 'Edit Content', 'description' => 'Can edit educational content', 'group' => 'content'],
            ['name' => 'publish_content', 'display_name' => 'Publish Content', 'description' => 'Can publish educational content', 'group' => 'content'],
            ['name' => 'curate_content', 'display_name' => 'Curate Content', 'description' => 'Can review and approve content for Islamic compliance', 'group' => 'content'],

            // Social Fund Management
            ['name' => 'view_social_funds', 'display_name' => 'View Social Funds', 'description' => 'Can view social fund transactions', 'group' => 'social_funds'],
            ['name' => 'manage_social_funds', 'display_name' => 'Manage Social Funds', 'description' => 'Can manage and approve social fund disbursements', 'group' => 'social_funds'],

            // Reports & Analytics
            ['name' => 'view_reports', 'display_name' => 'View Reports', 'description' => 'Can view system reports and analytics', 'group' => 'reports'],
            ['name' => 'export_data', 'display_name' => 'Export Data', 'description' => 'Can export system data', 'group' => 'reports'],

            // Settings
            ['name' => 'manage_settings', 'display_name' => 'Manage Settings', 'description' => 'Can manage system settings', 'group' => 'settings'],
            ['name' => 'manage_roles', 'display_name' => 'Manage Roles', 'description' => 'Can manage roles and permissions', 'group' => 'settings'],

            // Audit & Quality
            ['name' => 'view_audit_logs', 'display_name' => 'View Audit Logs', 'description' => 'Can view system audit logs', 'group' => 'audit'],
            ['name' => 'moderate_quality', 'display_name' => 'Moderate Quality', 'description' => 'Can moderate and ensure service quality', 'group' => 'audit'],
        ];

        foreach ($permissions as $permission) {
            $permission['created_at'] = now();
            $permission['updated_at'] = now();
            DB::table('permissions')->insert($permission);
        }

        // Assign permissions to roles
        $adminRole = DB::table('roles')->where('name', 'admin')->first();
        $kyaiRole = DB::table('roles')->where('name', 'kyai')->first();
        $consultantRole = DB::table('roles')->where('name', 'consultant')->first();
        $clientRole = DB::table('roles')->where('name', 'client')->first();

        $allPermissions = DB::table('permissions')->get();

        // Admin gets all permissions
        foreach ($allPermissions as $permission) {
            DB::table('role_permissions')->insert([
                'role_id' => $adminRole->id,
                'permission_id' => $permission->id,
            ]);
        }

        // Kyai permissions
        $kyaiPermissions = [
            'view_content', 'create_content', 'edit_content', 'curate_content', 'publish_content',
            'view_all_tickets', 'moderate_quality', 'view_audit_logs',
            'view_social_funds', 'manage_social_funds',
        ];
        foreach ($allPermissions as $permission) {
            if (in_array($permission->name, $kyaiPermissions)) {
                DB::table('role_permissions')->insert([
                    'role_id' => $kyaiRole->id,
                    'permission_id' => $permission->id,
                ]);
            }
        }

        // Consultant permissions
        $consultantPermissions = [
            'view_content', 'handle_tickets', 'view_programs', 'manage_programs',
        ];
        foreach ($allPermissions as $permission) {
            if (in_array($permission->name, $consultantPermissions)) {
                DB::table('role_permissions')->insert([
                    'role_id' => $consultantRole->id,
                    'permission_id' => $permission->id,
                ]);
            }
        }

        // Client permissions
        $clientPermissions = [
            'view_content', 'create_tickets',
        ];
        foreach ($allPermissions as $permission) {
            if (in_array($permission->name, $clientPermissions)) {
                DB::table('role_permissions')->insert([
                    'role_id' => $clientRole->id,
                    'permission_id' => $permission->id,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('role_permissions')->truncate();
        DB::table('permissions')->truncate();
        DB::table('roles')->truncate();
    }
};
