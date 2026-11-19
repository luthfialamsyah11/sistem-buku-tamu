<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VisitorController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/profile/password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', DashboardController::class);
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/visitors', [VisitorController::class, 'index']);
    Route::get('/meetings', [MeetingController::class, 'index']);

    Route::middleware('role:admin,resepsionis')->group(function () {
        Route::post('/visitors', [VisitorController::class, 'store']);
        Route::put('/visitors/{visitor}', [VisitorController::class, 'update']);
        Route::patch('/visitors/{visitor}/status', [VisitorController::class, 'updateStatus']);
        Route::delete('/visitors/{visitor}', [VisitorController::class, 'destroy']);
    });

    Route::middleware('role:admin,sekretaris')->group(function () {
        Route::post('/meetings', [MeetingController::class, 'store']);
        Route::put('/meetings/{meeting}', [MeetingController::class, 'update']);
        Route::patch('/meetings/{meeting}/status', [MeetingController::class, 'updateStatus']);
        Route::delete('/meetings/{meeting}', [MeetingController::class, 'destroy']);

        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{room}', [RoomController::class, 'update']);
        Route::delete('/rooms/{room}', [RoomController::class, 'destroy']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });
});
