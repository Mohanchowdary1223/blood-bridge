import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import DonorStackData from '@/models/donoralltypedata/DonorStackData';
import mongoose from 'mongoose';

// Create a new donation record
export async function POST(req: NextRequest) {
  await connectMongo();
  const body = await req.json();
  const { userId, recipientName, donationDate, location, bloodType, units, recipientAge, recipientGender, notes, status } = body;
  if (!userId || !recipientName || !donationDate || !location || !bloodType || !units || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const record = await DonorStackData.create({
      userId: new mongoose.Types.ObjectId(userId),
      recipientName,
      donationDate,
      location,
      bloodType,
      units,
      recipientAge,
      recipientGender,
      notes,
      status,
    });
    return NextResponse.json({ record }, { status: 201 });
  } catch (e) {
    const errMsg = (e instanceof Error) ? e.message : '';
    return NextResponse.json({ error: 'Failed to create record', details: errMsg }, { status: 500 });
  }
}

// Get all donation records for a user (userId in query)
export async function GET(req: NextRequest) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }
  try {
    const records = await DonorStackData.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ donationDate: -1 });
    return NextResponse.json({ records }, { status: 200 });
  } catch (e) {
    const errMsg = (e instanceof Error) ? e.message : '';
    return NextResponse.json({ error: 'Failed to fetch records', details: errMsg }, { status: 500 });
  }
}

// Update a donation record (id in body)
export async function PUT(req: NextRequest) {
  await connectMongo();
  const body = await req.json();
  const { id, userId, ...update } = body;
  if (!id || !userId) {
    return NextResponse.json({ error: 'Missing id or userId' }, { status: 400 });
  }
  try {
    const record = await DonorStackData.findOneAndUpdate(
      { _id: id, userId: new mongoose.Types.ObjectId(userId) },
      update,
      { new: true }
    );
    if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    return NextResponse.json({ record }, { status: 200 });
  } catch (e) {
    const errMsg = (e instanceof Error) ? e.message : '';
    return NextResponse.json({ error: 'Failed to update record', details: errMsg }, { status: 500 });
  }
}

// Delete a donation record (id, userId in body)
export async function DELETE(req: NextRequest) {
  await connectMongo();
  const body = await req.json();
  const { id, userId } = body;
  if (!id || !userId) {
    return NextResponse.json({ error: 'Missing id or userId' }, { status: 400 });
  }
  try {
    const result = await DonorStackData.findOneAndDelete({ _id: id, userId: new mongoose.Types.ObjectId(userId) });
    if (!result) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    const errMsg = (e instanceof Error) ? e.message : '';
    return NextResponse.json({ error: 'Failed to delete record', details: errMsg }, { status: 500 });
  }
}
