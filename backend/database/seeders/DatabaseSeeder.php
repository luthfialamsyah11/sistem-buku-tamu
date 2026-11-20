<?php

namespace Database\Seeders;

use App\Models\ItSupport;
use App\Models\Meeting;
use App\Models\Room;
use App\Models\User;
use App\Models\Visitor;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['id' => 1],
            [
                'nip' => '100001',
                'name' => 'Super Admin',
                'password' => 'password123',
                'phone' => '081234567890',
                'department' => 'IT & Sistem Informasi',
                'role' => 'admin',
            ]
        );

        $luthfi = User::updateOrCreate(
            ['id' => 2],
            [
                'nip' => '100002',
                'name' => 'Luthfi',
                'password' => 'password123',
                'phone' => '081298765432',
                'department' => 'IT & Jaringan',
                'role' => 'admin',
            ]
        );

        $resepsionis = User::updateOrCreate(
            ['id' => 3],
            [
                'nip' => '200001',
                'name' => 'Siti Rahma',
                'password' => 'password123',
                'phone' => '081345678901',
                'department' => 'Front Office & Resepsionis',
                'role' => 'resepsionis',
            ]
        );

        User::updateOrCreate(
            ['id' => 4],
            [
                'nip' => '200002',
                'name' => 'Adul Binjai',
                'password' => 'password123',
                'phone' => '081211223344',
                'department' => 'Pelayanan Tamu',
                'role' => 'resepsionis',
            ]
        );

        $sekretaris = User::updateOrCreate(
            ['id' => 5],
            [
                'nip' => '300001',
                'name' => 'Siti Sekretaris',
                'password' => 'password123',
                'phone' => '081388990011',
                'department' => 'Sekretariat Utama',
                'role' => 'sekretaris',
            ]
        );

        $r1 = Room::updateOrCreate(
            ['id' => 1],
            ['room_name' => 'Ruang Rapat 1', 'location' => 'Lantai 1', 'capacity' => 15, 'facilities' => 'Proyektor, Papan Tulis, AC', 'status' => 'available']
        );
        $r2 = Room::updateOrCreate(
            ['id' => 2],
            ['room_name' => 'Ruang Rapat 2', 'location' => 'Lantai 2', 'capacity' => 10, 'facilities' => 'TV LED, Whiteboard, AC', 'status' => 'available']
        );
        Room::updateOrCreate(
            ['id' => 3],
            ['room_name' => 'Ruang Rapat Utama', 'location' => 'Lantai 3', 'capacity' => 25, 'facilities' => 'Proyektor, Sound System, AC', 'status' => 'available']
        );

        $today = now()->toDateString();

        Visitor::updateOrCreate(
            ['id' => 1],
            [
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
            ]
        );

        Visitor::updateOrCreate(
            ['id' => 2],
            [
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
            ]
        );

        Meeting::updateOrCreate(
            ['id' => 1],
            [
                'title' => 'Rapat Koordinasi Mingguan',
                'description' => 'Pembahasan progres pekerjaan seluruh divisi',
                'room_id' => $r1->id,
                'organizer_id' => $sekretaris->id,
                'meeting_date' => $today,
                'start_time' => '09:00',
                'end_time' => '11:00',
                'participant_count' => 8,
                'status' => 'approved',
            ]
        );

        Meeting::updateOrCreate(
            ['id' => 2],
            [
                'title' => 'Rapat Pembahasan Anggaran',
                'description' => 'Review rencana anggaran operasional',
                'room_id' => $r2->id,
                'organizer_id' => $sekretaris->id,
                'meeting_date' => $today,
                'start_time' => '13:30',
                'end_time' => '15:00',
                'participant_count' => 5,
                'status' => 'approved',
            ]
        );

        ItSupport::updateOrCreate(
            ['id' => 1],
            [
                'reporter_name' => 'Andi Wijaya',
                'reporter_phone' => '081233445566',
                'department' => 'Keuangan',
                'complaint' => 'Printer kasir tidak bisa menarik kertas dan lampu indikator berkedip merah saat mencetak slip.',
                'report_date' => $today,
                'category' => 'hardware',
                'damage_type' => 'Printer Macet / Paper Jam',
                'status' => 'pending',
            ]
        );

        ItSupport::updateOrCreate(
            ['id' => 2],
            [
                'reporter_name' => 'Rini Kusuma',
                'reporter_phone' => '085211223344',
                'department' => 'Pelayanan Pelanggan',
                'complaint' => 'Aplikasi billing muncul error koneksi database saat submit data pembayaran baru.',
                'report_date' => $today,
                'category' => 'software',
                'damage_type' => 'Error Koneksi Database Aplikasi',
                'status' => 'in_progress',
            ]
        );

        ItSupport::updateOrCreate(
            ['id' => 3],
            [
                'reporter_name' => 'Ahmad Fauzi',
                'reporter_phone' => '085712348899',
                'department' => 'Umum & Logistik',
                'complaint' => 'Komputer ruang logistik sering restart sendiri saat membuka laporan bulanan di Excel.',
                'report_date' => $today,
                'category' => 'hardware',
                'damage_type' => 'PC Restart Mandiri / Power Supply Drop',
                'status' => 'resolved',
            ]
        );

        ItSupport::updateOrCreate(
            ['id' => 4],
            [
                'reporter_name' => 'Bambang Irawan',
                'reporter_phone' => '087899001122',
                'department' => 'Teknik & Produksi',
                'complaint' => 'Permintaan install ulang aplikasi CAD lisensi kantor pada workstation teknisi baru.',
                'report_date' => $today,
                'category' => 'software',
                'damage_type' => 'Instalasi & Aktivasi Software CAD',
                'status' => 'resolved',
            ]
        );
    }
}
