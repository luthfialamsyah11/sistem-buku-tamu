<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItSupport extends Model
{
    protected $fillable = [
        'reporter_name',
        'reporter_phone',
        'department',
        'complaint',
        'report_date',
        'category',
        'damage_type',
        'photo_before',
        'photo_after',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'report_date' => 'date:Y-m-d',
        ];
    }
}
