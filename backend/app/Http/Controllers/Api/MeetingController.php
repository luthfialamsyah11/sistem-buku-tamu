<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        $meetings = Meeting::with(['room:id,room_name,location,capacity', 'organizer:id,name,department'])
            ->when($request->date, fn ($q, $date) => $q->whereDate('meeting_date', $date))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->room_id, fn ($q, $room) => $q->where('room_id', $room))
            ->when($request->boolean('mine'), fn ($q) => $q->where('organizer_id', $request->user()->id))
            ->when($request->search, fn ($q, $s) => $q->where('title', 'like', "%{$s}%"))
            ->orderByDesc('meeting_date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $meetings,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $data = $this->validated($request);
        $data['participant_count'] = $data['participant_count'] ?? 1;

        if (Meeting::isBentrok($data['room_id'], $data['meeting_date'], $data['start_time'], $data['end_time'])) {
            return $this->bentrok();
        }

        $data['organizer_id'] = $user->id;
        $data['status'] = 'approved';

        $meeting = Meeting::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal rapat berhasil dibuat',
            'data' => $meeting->load(['room:id,room_name,location', 'organizer:id,name']),
        ], 201);
    }

    public function update(Request $request, Meeting $meeting)
    {
        $data = $this->validated($request);

        if (Meeting::isBentrok($data['room_id'], $data['meeting_date'], $data['start_time'], $data['end_time'], $meeting->id)) {
            return $this->bentrok();
        }

        $meeting->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Jadwal rapat berhasil diperbarui',
            'data' => $meeting->load(['room:id,room_name,location', 'organizer:id,name']),
        ]);
    }

    public function updateStatus(Request $request, Meeting $meeting)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected,completed,cancelled',
        ]);

        $meeting->update(['status' => $request->status]);

        $label = [
            'pending' => 'dikembalikan ke pending',
            'approved' => 'disetujui',
            'rejected' => 'ditolak',
            'completed' => 'ditandai selesai',
            'cancelled' => 'dibatalkan',
        ][$request->status];

        return response()->json([
            'success' => true,
            'message' => "Rapat berhasil {$label}",
            'data' => $meeting->load(['room:id,room_name,location', 'organizer:id,name']),
        ]);
    }

    public function destroy(Request $request, Meeting $meeting)
    {
        $meeting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal rapat berhasil dihapus',
        ]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'room_id' => 'required|exists:rooms,id',
            'meeting_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'participant_count' => 'nullable|integer|min:1',
        ]);
    }

    private function bentrok()
    {
        return response()->json([
            'success' => false,
            'message' => 'Jadwal bentrok, ruangan sudah dipakai di jam tersebut',
        ], 422);
    }
}
