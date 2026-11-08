import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const rawFiles = formData.getAll('files') as File[];

        if (!rawFiles || rawFiles.length === 0) {
            return NextResponse.json({ error: 'No se enviaron imágenes' }, { status: 400 });
        }

        const files = rawFiles.slice(0, 5);
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'referencias');
        let canWriteToPublic = !process.env.VERCEL;
        if (canWriteToPublic) {
            try {
                await mkdir(uploadDir, { recursive: true });
            } catch {
                canWriteToPublic = false;
            }
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            if (!file.name || !file.type.startsWith('image/')) continue;

            const cleanName = file.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9.-]/g, '_');

            const uniqueFilename = `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${cleanName}`;
            const filePath = path.join(uploadDir, uniqueFilename);

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            if (canWriteToPublic) {
                try {
                    await writeFile(filePath, buffer);
                    uploadedUrls.push(`/uploads/referencias/${uniqueFilename}`);
                    continue;
                } catch {
                    canWriteToPublic = false;
                }
            }

            const mimeType = file.type || 'image/jpeg';
            uploadedUrls.push(`data:${mimeType};base64,${buffer.toString('base64')}`);
        }

        return NextResponse.json({
            success: true,
            urls: uploadedUrls
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Error al subir imágenes de referencia: ' + (error?.message || 'Error desconocido') },
            { status: 500 }
        );
    }
}
