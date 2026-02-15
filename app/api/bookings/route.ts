import { NextRequest, NextResponse } from 'next/server';
import { createBooking } from '@/lib/actions/booking.actions';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { eventSlug, email } = body;

        if (!eventSlug || !email) {
            return NextResponse.json(
                { error: 'Event slug and email are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        const result = await createBooking(eventSlug, email);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Booking created successfully',
                bookingId: result.bookingId
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('API booking error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
