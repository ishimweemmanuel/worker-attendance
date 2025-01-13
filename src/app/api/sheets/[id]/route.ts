import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Sheet from '@/models/Sheet';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const sheet = await Sheet.findById(context.params.id);

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
