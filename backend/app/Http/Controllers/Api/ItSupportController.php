<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ItSupport;
use Illuminate\Http\Request;

class ItSupportController extends Controller
{
    public function index(Request $request)
    {
        $items = ItSupport::query()
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->category, fn ($q, $category) => $q->where('category', $category))
            ->when($request->search, function ($q, $s) {
                $q->where(fn ($w) => $w->where('reporter_name', 'like', "%{$s}%")
                    ->orWhere('reporter_phone', 'like', "%{$s}%")
                    ->orWhere('department', 'like', "%{$s}%")
                    ->orWhere('damage_type', 'like', "%{$s}%")
                    ->orWhere('complaint', 'like', "%{$s}%"));
            })
            ->orderByDesc('report_date')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['status'] = $data['status'] ?? 'pending';

        $item = ItSupport::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Data komplain IT berhasil ditambahkan',
            'data' => $item,
        ], 201);
    }

    public function update(Request $request, ItSupport $itSupport)
    {
        $data = $this->validated($request);
        if (empty($data['status'])) {
            unset($data['status']);
        }

        $itSupport->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data komplain IT berhasil diperbarui',
            'data' => $itSupport,
        ]);
    }

    public function updateStatus(Request $request, ItSupport $itSupport)
    {
        $request->validate([
            'status' => 'required|in:pending,in_progress,resolved,rejected',
        ]);

        $itSupport->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status komplain berhasil diperbarui',
            'data' => $itSupport,
        ]);
    }

    public function destroy(ItSupport $itSupport)
    {
        $itSupport->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data komplain IT berhasil dihapus',
        ]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'reporter_name' => 'required|string|max:150',
            'reporter_phone' => 'required|string|max:30',
            'department' => 'required|string|max:100',
            'complaint' => 'required|string',
            'report_date' => 'required|date',
            'category' => 'required|in:hardware,software',
            'damage_type' => 'required|string|max:150',
            'photo_before' => 'nullable|string',
            'photo_after' => 'nullable|string',
            'status' => 'nullable|in:pending,in_progress,resolved,rejected',
        ]);
    }
}
