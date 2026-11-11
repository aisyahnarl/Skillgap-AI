import { NextResponse } from 'next/server';
import { processCvUpload } from '../../../lib/cv-parser';
import { getVerifiedUser } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const targetRole = (formData.get('targetRole') as string) || 'Frontend Developer';

    if (!file) {
      return NextResponse.json({ success: false, message: 'Tidak ada file yang diunggah.' }, { status: 400 });
    }

    // Periksa ekstensi file yang diizinkan
    const fileName = file.name;
    const ext = fileName.toLowerCase().split('.').pop() ?? '';
    const allowed = ['pdf', 'docx', 'doc', 'txt', 'md'];

    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { success: false, message: `Format .${ext} tidak didukung. Unggah berkas PDF atau DOCX.` },
        { status: 400 }
      );
    }

    // Batas ukuran (20 MB)
    const maxBytes = 20 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ success: false, message: 'Ukuran file melebihi batas 20 MB.' }, { status: 400 });
    }

    // Cek user yang login jika ada
    const user = await getVerifiedUser(request);
    const userId = user?.id;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Proses pipeline: simpan ke storage server, ekstraksi teks PDF/DOCX, skill matching & cosine similarity
    const result = await processCvUpload(buffer, fileName, file.size, userId, targetRole);

    return NextResponse.json({
      success: true,
      message: 'CV berhasil diproses dan diekstraksi menggunakan AI.',
      data: result,
    });
  } catch (error: any) {
    console.error('[Document Upload API Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses unggahan CV.' },
      { status: 500 }
    );
  }
}
