'use server'

import { unstable_noStore as noStore } from 'next/cache';
import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const createBooking = async (eventSlug: string, email: string) => {
    try {
        noStore();
        await connectDB();

        // Find event by slug
        const event = await Event.findOne({ slug: eventSlug });

        if (!event) {
            return { success: false, error: 'Event not found' };
        }

        // Check if booking already exists
        const existingBooking = await Booking.findOne({
            eventId: event._id,
            email: email.toLowerCase().trim()
        });

        if (existingBooking) {
            return { success: false, error: 'You have already booked this event' };
        }

        // Create booking
        const booking = await Booking.create({
            eventId: event._id,
            email: email.toLowerCase().trim()
        });

        // Send confirmation email
        try {
            await resend.emails.send({
                from: 'DevEvents <onboarding@resend.dev>',
                to: email,
                subject: `Booking Confirmed: ${event.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #333;">Booking Confirmed!</h1>
                        <p>Thank you for booking your spot at <strong>${event.title}</strong>.</p>

                        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h2 style="margin-top: 0;">Event Details</h2>
                            <p><strong>Date:</strong> ${event.date}</p>
                            <p><strong>Time:</strong> ${event.time}</p>
                            <p><strong>Location:</strong> ${event.location}</p>
                            <p><strong>Mode:</strong> ${event.mode}</p>
                        </div>

                        <p>${event.description}</p>

                        <p style="margin-top: 30px;">We look forward to seeing you there!</p>
                        <p style="color: #666; font-size: 12px;">If you have any questions, please reply to this email.</p>
                    </div>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue even if email fails - booking is still created
        }

        return { success: true, bookingId: booking._id.toString() };

    } catch (error: any) {
        console.error('Booking creation error:', error);

        if (error.code === 11000) {
            return { success: false, error: 'You have already booked this event' };
        }

        return { success: false, error: 'Failed to create booking. Please try again.' };
    }
}

export const getBookingCount = async (eventSlug: string) => {
    try {
        noStore();
        await connectDB();

        const event = await Event.findOne({ slug: eventSlug });

        if (!event) {
            return 0;
        }

        const count = await Booking.countDocuments({ eventId: event._id });
        return count;

    } catch (error) {
        console.error('Error fetching booking count:', error);
        return 0;
    }
}
