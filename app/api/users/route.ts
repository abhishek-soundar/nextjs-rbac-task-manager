
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

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

export async function GET(req: Request) {
    try {
        await dbConnect();

        const currentUser: any = await getCurrentUser(req);
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const users = await User.find({ role: 'USER' }).select('email _id');
        return NextResponse.json(users);

    } catch (error) {
        console.error('Fetch users error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
