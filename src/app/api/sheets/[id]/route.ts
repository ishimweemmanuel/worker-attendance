import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Sheet from '@/models/Sheet';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const id = context.params.id;
    const sheet = await Sheet.findById(id);

    if (!sheet) {
      return NextResponse.json(
        { error: 'Sheet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sheet);
  } catch (error) {
    console.error('Error fetching sheet:', error);
    return NextResponse.json(
      { error: 'Error fetching sheet' },
      { status: 500 }
    );
  }
}
