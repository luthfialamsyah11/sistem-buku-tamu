<?php

namespace Database\Seeders;

use App\Models\Meeting;
use App\Models\Room;
use App\Models\User;
use App\Models\Visitor;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Admin Utama',
            'email' => 'admin@kantor.com',
            'password' => 'password123',
            'phone' => '081234567890',
            'department' => 'Manajemen',
            'role' => 'admin',
        ]);

        $resepsionis = User::create([
            'name' => 'Rina (Resepsionis)',
            'email' => 'resepsionis@kantor.com',
            'password' => 'password123',
            'phone' => '081211223344',
            'department' => 'Front Office',
            'role' => 'resepsionis',
        ]);

        $sekretaris = User::create([
            'name' => 'Siti (Sekretaris)',
            'email' => 'sekretaris@kantor.com',
            'password' => 'password123',
            'phone' => '081388990011',
            'department' => 'Sekretariat',
            'role' => 'sekretaris',
        ]);

        $luthfi = User::create([
            'name' => 'Luthfi',
            'email' => 'luthfi@kantor.com',
            'password' => 'password123',
            'phone' => '081298765432',
            'department' => 'IT',
            'role' => 'admin',
        ]);

        $r1 = Room::create(['room_name' => 'Ruang Rapat 1', 'location' => 'Lantai 1', 'capacity' => 15, 'facilities' => 'Proyektor, Papan Tulis, AC']);
        $r2 = Room::create(['room_name' => 'Ruang Rapat 2', 'location' => 'Lantai 2', 'capacity' => 10, 'facilities' => 'TV LED, Whiteboard, AC']);
        Room::create(['room_name' => 'Ruang Rapat Utama', 'location' => 'Lantai 3', 'capacity' => 25, 'facilities' => 'Proyektor, Sound System, AC']);

        $today = now()->toDateString();

        Visitor::create([
            'visitor_name' => 'Budi Santoso',
            'visitor_email' => 'budi@gmail.com',
            'visitor_phone' => '081122334455',
            'company' => 'PT Mitra Jaya',
            'host_user_id' => $luthfi->id,
            'host_name' => 'Luthfi (IT)',
            'created_by' => $resepsionis->id,
            'purpose' => 'Diskusi jaringan server',
            'visit_date' => $today,
            'check_in_time' => now(),
            'status' => 'checked_in',
            'notes' => 'Jl. Sudirman No. 45, Jakarta Pusat',
        ]);

        Visitor::create([
            'visitor_name' => 'Dewi Lestari',
            'visitor_email' => 'dewi@gmail.com',
            'visitor_phone' => '085677889900',
            'company' => 'CV Kreasi Media',
            'host_user_id' => $sekretaris->id,
            'host_name' => 'Siti (Sekretariat)',
            'created_by' => $resepsionis->id,
            'purpose' => 'Pengantaran berkas kerjasama',
            'visit_date' => $today,
            'status' => 'pending',
            'notes' => 'Jl. Melati Raya No. 12, Bandung',
        ]);

        Meeting::create([
            'title' => 'Rapat Koordinasi Mingguan',
            'description' => 'Pembahasan progres pekerjaan seluruh divisi',
            'room_id' => $r1->id,
            'organizer_id' => $sekretaris->id,
            'meeting_date' => $today,
            'start_time' => '09:00',
            'end_time' => '11:00',
            'participant_count' => 8,
            'status' => 'approved',
        ]);

        Meeting::create([
            'title' => 'Rapat Pembahasan Anggaran',
            'description' => 'Review rencana anggaran operasional',
            'room_id' => $r2->id,
            'organizer_id' => $sekretaris->id,
            'meeting_date' => $today,
            'start_time' => '13:30',
            'end_time' => '15:00',
            'participant_count' => 5,
            'status' => 'approved',
        ]);
    }
}
