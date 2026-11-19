<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use App\Models\Room;
use App\Models\Visitor;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $today = now()->toDateString();

        return response()->json([
            'success' => true,
            'data' => [
                'visitors_today' => Visitor::whereDate('visit_date', $today)->count(),
                'visitors_active' => Visitor::where('status', 'checked_in')->count(),
                'meetings_today' => Meeting::whereDate('meeting_date', $today)->count(),
                'meetings_pending' => Meeting::where('status', 'pending')->count(),
                'rooms_available' => Room::where('status', 'available')->count(),
                'recent_visitors' => Visitor::with('host:id,name,department')->latest()->take(4)->get(),
                'today_meetings' => Meeting::with(['room:id,room_name,location', 'organizer:id,name'])
                    ->whereDate('meeting_date', $today)
                    ->whereIn('status', ['pending', 'approved'])
                    ->orderBy('start_time')
                    ->get(),
            ],
        ]);
    }
}
