<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'department',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isResepsionis(): bool
    {
        return $this->role === 'resepsionis';
    }

    public function isSekretaris(): bool
    {
        return $this->role === 'sekretaris';
    }

    public function canManageVisitors(): bool
    {
        return in_array($this->role, ['admin', 'resepsionis']);
    }

    public function canManageMeetings(): bool
    {
        return in_array($this->role, ['admin', 'sekretaris']);
    }

    public function canManageRooms(): bool
    {
        return in_array($this->role, ['admin', 'sekretaris']);
    }

    public function hostedVisitors()
    {
        return $this->hasMany(Visitor::class, 'host_user_id');
    }

    public function meetings()
    {
        return $this->hasMany(Meeting::class, 'organizer_id');
    }
}
