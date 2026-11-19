<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visitor extends Model
{
    protected $fillable = [
        'visitor_name',
        'visitor_email',
        'visitor_phone',
        'company',
        'identity_number',
        'host_user_id',
        'host_name',
        'created_by',
        'purpose',
        'visit_date',
        'check_in_time',
        'check_out_time',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'date:Y-m-d',
            'check_in_time' => 'datetime:Y-m-d H:i',
            'check_out_time' => 'datetime:Y-m-d H:i',
        ];
    }

    public function host()
    {
        return $this->belongsTo(User::class, 'host_user_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

