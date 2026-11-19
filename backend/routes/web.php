<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'status' => 'online',
        'app' => 'API Buku Tamu & Jadwal Rapat',
    ]);
});
