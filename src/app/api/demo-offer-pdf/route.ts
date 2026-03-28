import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'Templateturkey.pdf.pdf');
    const fileBuffer = await readFile(filePath);

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Templateturkey.pdf.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response('Demo offer PDF not found.', { status: 404 });
  }
}
