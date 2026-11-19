<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Room;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Room::orderBy('room_name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['capacity'] = $data['capacity'] ?? 10;

        $room = Room::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Ruangan berhasil ditambahkan',
            'data' => $room,
        ], 201);
    }

    public function update(Request $request, Room $room)
    {
        $data = $this->validated($request);
        $data['capacity'] = $data['capacity'] ?? $room->capacity ?? 10;

        $room->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Ruangan berhasil diperbarui',
            'data' => $room,
        ]);
    }

    public function destroy(Room $room)
    {
        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ruangan berhasil dihapus',
        ]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'room_name' => 'required|string|max:100',
            'location' => 'required|string|max:150',
            'capacity' => 'nullable|integer|min:1',
            'facilities' => 'nullable|string',
            'status' => 'required|in:available,maintenance',
        ]);
    }
}
