import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Sheet from '@/models/Sheet';

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Log the incoming data for debugging
    console.log('Incoming sheet data:', data);
    console.log('Location value:', data.location);

    const sheet = await Sheet.create(data);
    return NextResponse.json(sheet, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sheet:', error);
    return NextResponse.json(
      { 
        error: 'Error creating sheet',
        details: error.message,
        validationErrors: error.errors
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const sheets = await Sheet.find().sort({ createdAt: -1 });
    return NextResponse.json(sheets);
  } catch (error) {
    console.error('Error fetching sheets:', error);
    return NextResponse.json(
      { error: 'Error fetching sheets' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Sheet ID is required' },
        { status: 400 }
      );
    }

    const deletedSheet = await Sheet.findByIdAndDelete(id);
    
    if (!deletedSheet) {
      return NextResponse.json(
        { error: 'Sheet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Sheet deleted successfully' });
  } catch (error) {
    console.error('Error deleting sheet:', error);
    return NextResponse.json(
      { error: 'Error deleting sheet' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Sheet ID is required' },
        { status: 400 }
      );
    }

    const updatedSheet = await Sheet.findByIdAndUpdate(
      id,
      { 
        ...data,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedSheet) {
      return NextResponse.json(
        { error: 'Sheet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSheet);
  } catch (error: any) {
    console.error('Error updating sheet:', error);
    return NextResponse.json(
      { 
        error: 'Error updating sheet',
        details: error.message,
        validationErrors: error.errors
      },
      { status: 500 }
    );
  }
}
