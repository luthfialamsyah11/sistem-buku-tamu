<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    protected $fillable = [
        'title',
        'description',
        'room_id',
        'organizer_id',
        'meeting_date',
        'start_time',
        'end_time',
        'participant_count',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'meeting_date' => 'date:Y-m-d',
            'participant_count' => 'integer',
        ];
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public static function isBentrok(int $roomId, string $date, string $start, string $end, ?int $exceptId = null): bool
    {
        return static::where('room_id', $roomId)
            ->whereDate('meeting_date', $date)
            ->whereIn('status', ['pending', 'approved'])
            ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
            ->where('start_time', '<', $end)
            ->where('end_time', '>', $start)
            ->exists();
    }
}
