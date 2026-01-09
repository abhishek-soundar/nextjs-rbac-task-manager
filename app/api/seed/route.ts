
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        await dbConnect();

        // Check if users already exist
        const count = await User.countDocuments();
        if (count > 0) {
            return NextResponse.json({ message: 'Database already seeded' });
        }

        const hashedPassword = await bcrypt.hash('password123', 10);

        await User.create([
            {
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'ADMIN',
            },
            {
                email: 'user@example.com',
                password: hashedPassword,
                role: 'USER',
            },
        ]);

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
