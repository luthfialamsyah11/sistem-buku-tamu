<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Visitor;
use Illuminate\Http\Request;

class VisitorController extends Controller
{
    public function index(Request $request)
    {
        $visitors = Visitor::with('host:id,name,department')
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->search, function ($q, $s) {
                $q->where(fn ($w) => $w->where('visitor_name', 'like', "%{$s}%")
                    ->orWhere('company', 'like', "%{$s}%")
                    ->orWhere('host_name', 'like', "%{$s}%")
                    ->orWhere('purpose', 'like', "%{$s}%"));
            })
            ->orderByDesc('visit_date')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $visitors,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['host_user_id'] = $this->resolveHostUserId($request, $data['host_name']);
        $data['created_by'] = $request->user()->id;
        $data['status'] = 'pending';

        $visitor = Visitor::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Data tamu berhasil disimpan',
            'data' => $visitor->load('host:id,name,department'),
        ], 201);
    }

    public function update(Request $request, Visitor $visitor)
    {
        $data = $this->validated($request);
        $data['host_user_id'] = $this->resolveHostUserId($request, $data['host_name']);

        $visitor->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data tamu berhasil diperbarui',
            'data' => $visitor->load('host:id,name,department'),
        ]);
    }

    public function updateStatus(Request $request, Visitor $visitor)
    {
        $request->validate([
            'status' => 'required|in:pending,checked_in,checked_out,rejected',
        ]);

        $visitor->status = $request->status;

        if ($request->status === 'checked_in') {
            $visitor->check_in_time = now();
        }
        if ($request->status === 'checked_out') {
            $visitor->check_out_time = now();
        }

        $visitor->save();

        $label = [
            'pending' => 'menunggu',
            'checked_in' => 'check-in',
            'checked_out' => 'check-out',
            'rejected' => 'ditolak',
        ][$request->status];

        return response()->json([
            'success' => true,
            'message' => "Tamu berhasil di-{$label}",
            'data' => $visitor->load('host:id,name,department'),
        ]);
    }

    public function destroy(Request $request, Visitor $visitor)
    {
        $visitor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data tamu berhasil dihapus',
        ]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'visitor_name' => 'required|string|max:150',
            'visitor_email' => 'nullable|email|max:150',
            'visitor_phone' => 'required|string|max:30',
            'company' => 'nullable|string|max:150',
            'identity_number' => 'nullable|string|max:50',
            'host_name' => 'required|string|max:150',
            'purpose' => 'required|string|max:255',
            'visit_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);
    }

    private function resolveHostUserId(Request $request, string $hostName): int
    {
        $matched = User::where('name', 'like', '%' . trim($hostName) . '%')->first();

        return $matched?->id ?? $request->user()->id;
    }
}
