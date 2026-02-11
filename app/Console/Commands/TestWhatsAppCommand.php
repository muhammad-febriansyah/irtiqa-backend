<?php

namespace App\Console\Commands;

use App\Services\WhatsAppService;
use Illuminate\Console\Command;

class TestWhatsAppCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'whatsapp:test {phone}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test WhatsApp gateway connection by sending a test message';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $phone = $this->argument('phone');

        $this->info('Testing WhatsApp gateway...');
        $this->newLine();

        $whatsapp = new WhatsAppService();

        if (!$whatsapp->isConfigured()) {
            $this->error('❌ WhatsApp gateway is not configured!');
            $this->warn('Please set whatsapp_api_key and whatsapp_sender in Site Settings.');
            return 1;
        }

        $this->info('✓ WhatsApp gateway is configured');
        $this->newLine();

        $this->info("Sending test message to: {$phone}");

        $result = $whatsapp->testConnection($phone);

        if ($result['success']) {
            $this->newLine();
            $this->info('✅ WhatsApp message sent successfully!');
            $this->info('Check the recipient phone for the test message.');
            return 0;
        } else {
            $this->newLine();
            $this->error('❌ Failed to send WhatsApp message');
            $this->error('Error: ' . $result['message']);
            if (isset($result['error'])) {
                $this->warn('Details: ' . $result['error']);
            }
            return 1;
        }
    }
}
