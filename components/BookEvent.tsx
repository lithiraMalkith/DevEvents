'use client'
import {useState} from "react";
import {useParams} from "next/navigation";

const BookEvent = () => {
    const params = useParams();
    const slug = params?.slug as string;

    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventSlug: slug,
                    email: email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to book event');
                setLoading(false);
                return;
            }

            setSubmitted(true);
        } catch (err) {
            setError('Failed to book event. Please try again.');
            console.error('Booking error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div id="book-event">
            {submitted ? (
                <p className="text-sm">Thank you for signing up! Check your email for confirmation.</p>
            ): (
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email address"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <p className="text-sm" style={{color: 'red'}}>{error}</p>}

                    <button  type="submit" className="button submit" disabled={loading}>
                        {loading ? 'Booking...' : 'Submit'}
                    </button>
                </form>
            )}
        </div>
    )
}
export default BookEvent
