<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $users = User::query()
            ->when($request->search, function ($q, $s) {
                $q->where(fn ($w) => $w->where('name', 'like', "%{$s}%")
                    ->orWhere('nip', 'like', "%{$s}%")
                    ->orWhere('department', 'like', "%{$s}%"));
            })
            ->orderBy('nip')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nip' => 'required|string|max:6|regex:/^[0-9]{1,6}$/|unique:users,nip',
            'name' => 'required|string|max:150',
            'password' => 'required|min:6',
            'phone' => 'nullable|string|max:30',
            'department' => 'nullable|string|max:100',
            'role' => 'required|in:admin,resepsionis,sekretaris',
        ]);

        $user = User::create($data);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil ditambahkan',
            'data' => $user,
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'nip' => ['required', 'string', 'max:6', 'regex:/^[0-9]{1,6}$/', Rule::unique('users')->ignore($user->id)],
            'name' => 'required|string|max:150',
            'password' => 'nullable|min:6',
            'phone' => 'nullable|string|max:30',
            'department' => 'nullable|string|max:100',
            'role' => 'required|in:admin,resepsionis,sekretaris',
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diperbarui',
            'data' => $user,
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menghapus akun sendiri',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus',
        ]);
    }
}
