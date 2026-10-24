import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            // Also check for singular 'file'
            const singleFile = formData.get('file') as File | null;
            if (singleFile) {
                files.push(singleFile);
            } else {
                return NextResponse.json({ error: 'No se enviaron archivos' }, { status: 400 });
            }
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const uploadedUrls: string[] = [];

        for (const file of files) {
            if (!file.name) continue;

            // Generate clean unique filename
            const cleanName = file.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9.-]/g, '_');
            
            const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${cleanName}`;
            const filePath = path.join(uploadDir, uniqueFilename);

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            await writeFile(filePath, buffer);

            uploadedUrls.push(`/uploads/${uniqueFilename}`);
        }

        return NextResponse.json({
            success: true,
            urls: uploadedUrls,
            url: uploadedUrls[0] || null
        });
    } catch (error: any) {
        console.error('Error al subir archivos:', error);
        return NextResponse.json(
            { error: 'Error al procesar la subida: ' + (error?.message || 'Error desconocido') },
            { status: 500 }
        );
    }
}
