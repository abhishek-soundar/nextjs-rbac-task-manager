
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import { headers } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Helper to get current user info from token (redundant check, but safer)
async function getCurrentUser(req: Request) {
    const cookieHeader = req.headers.get('cookie');
    const token = cookieHeader?.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (e) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();

        const currentUser: any = await getCurrentUser(req);
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { title, description, assignedTo } = await req.json();

        if (!title || !assignedTo) {
            return NextResponse.json({ error: 'Title and Assigned User are required' }, { status: 400 });
        }

        const assignedUser = await User.findById(assignedTo);
        if (!assignedUser || assignedUser.role !== 'USER') {
            return NextResponse.json({ error: 'Invalid user for assignment' }, { status: 400 });
        }

        const task = await Task.create({
            title,
            description,
            assignedTo,
            createdBy: currentUser.userId,
            status: 'PENDING'
        });

        return NextResponse.json(task, { status: 201 });

    } catch (error) {
        console.error('Create task error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();

        const currentUser: any = await getCurrentUser(req);
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const tasks = await Task.find({})
            .populate('assignedTo', 'email')
            .populate('createdBy', 'email')
            .sort({ createdAt: -1 });

        return NextResponse.json(tasks);

    } catch (error) {
        console.error('Fetch tasks error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
