
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import mongoose from 'mongoose';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export async function GET(req: Request) {
    try {
        await dbConnect();

        // 1. Get Token from Cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
        }

        // 2. Verify Token
        let payload;
        try {
            const secret = new TextEncoder().encode(JWT_SECRET);
            const verified = await jwtVerify(token, secret);
            payload = verified.payload;
        } catch (err) {
            console.error("JWT Verification failed:", err);
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }

        // 3. Extract and Validate User ID
        // Explicitly convert to string to handle any edge cases where it might be an object/buffer
        const userIdString = String(payload.userId);

        if (!mongoose.Types.ObjectId.isValid(userIdString)) {
            console.error(`Invalid ObjectId encountered: ${userIdString}`);
            return NextResponse.json({ error: 'Invalid User ID in token' }, { status: 400 });
        }

        // 4. Query Tasks
        const tasks = await Task.find({ assignedTo: new mongoose.Types.ObjectId(userIdString) })
            .populate('createdBy', 'email')
            .sort({ createdAt: -1 });

        return NextResponse.json(tasks);

    } catch (error) {
        console.error('Fetch my tasks error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
