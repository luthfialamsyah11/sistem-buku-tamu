<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('it_supports', function (Blueprint $table) {
            $table->id();
            $table->string('reporter_name', 150);
            $table->string('reporter_phone', 30);
            $table->string('department', 100);
            $table->text('complaint');
            $table->date('report_date');
            $table->enum('category', ['hardware', 'software'])->default('hardware');
            $table->string('damage_type', 150);
            $table->longText('photo_before')->nullable();
            $table->longText('photo_after')->nullable();
            $table->enum('status', ['pending', 'in_progress', 'resolved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('it_supports');
    }
};
