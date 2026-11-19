<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_name', 100);
            $table->string('location', 150);
            $table->unsignedInteger('capacity')->default(10);
            $table->text('facilities')->nullable();
            $table->enum('status', ['available', 'maintenance'])->default('available');
            $table->timestamps();
        });

        Schema::create('visitors', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_name', 150);
            $table->string('visitor_email', 150)->nullable();
            $table->string('visitor_phone', 30);
            $table->string('company', 150)->nullable();
            $table->string('identity_number', 50)->nullable();
            $table->foreignId('host_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('host_name', 150)->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->string('purpose');
            $table->date('visit_date');
            $table->dateTime('check_in_time')->nullable();
            $table->dateTime('check_out_time')->nullable();
            $table->enum('status', ['pending', 'checked_in', 'checked_out', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('users')->cascadeOnDelete();
            $table->date('meeting_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('participant_count')->default(2);
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
        Schema::dropIfExists('visitors');
        Schema::dropIfExists('rooms');
    }
};

