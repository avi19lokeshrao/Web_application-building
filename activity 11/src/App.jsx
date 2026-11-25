import { useState, useEffect } from 'react';
import { supabase } from './supabase.js';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MatchCard } from './components/MatchCard';
import { Footer } from './components/Footer';
import './App.css';

export default function App() {
  const [matches, setMatches] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Step 3: Fetch matches from Supabase
  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error fetching matches:', error);
        setStatusMessage('Error loading matches: ' + error.message);
      } else if (data) {
        setMatches(data);
      }
    } catch (err) {
      console.error('Unexpected error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch total bookings count from Supabase
  const fetchBookingCount = async () => {
    try {
      const { count, error } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        setTotalBookings(count);
      }
    } catch (err) {
      console.error('Error fetching bookings count:', err);
    }
  };

  // Step 3 & Step 5: Initial fetch and Realtime subscription
  useEffect(() => {
    fetchMatches();
    fetchBookingCount();

    // Step 5: Add realtime subscription for matches table
    const matchesChannel = supabase
      .channel('realtime-matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        (payload) => {
          console.log('Realtime change in matches:', payload);
          if (payload.eventType === 'UPDATE') {
            setMatches((prevMatches) =>
              prevMatches.map((match) =>
                match.id === payload.new.id ? payload.new : match
              )
            );
          } else {
            fetchMatches();
          }
        }
      )
      .subscribe();

    // Realtime subscription for bookings count
    const bookingsChannel = supabase
      .channel('realtime-bookings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        () => {
          setTotalBookings((prev) => prev + 1);
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(bookingsChannel);
    };
  }, []);

  // Step 4: Implement booking (insert into bookings & update available_seats)
  const handleSelectMatch = async (selectedMatch) => {
    const currentSeats =
      selectedMatch.available_seats !== undefined
        ? selectedMatch.available_seats
        : selectedMatch.availableSeats;

    if (currentSeats <= 0) return;

    try {
      const matchTitle = `${selectedMatch.team1} vs ${selectedMatch.team2}`;
      const ticketPrice = selectedMatch.price || 1500;

      // 1. Insert record into bookings table matching Supabase schema constraints
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            match_id: selectedMatch.id,
            user_name: 'Guest User',
            match_title: matchTitle,
            tickets: 1,
            total_price: ticketPrice,
          },
        ]);

      if (bookingError) {
        console.error('Error creating booking:', bookingError);
        alert('Booking failed: ' + bookingError.message);
        return;
      }

      // 2. Decrement and update available_seats in matches table
      const newSeatCount = currentSeats - 1;
      const { error: updateError } = await supabase
        .from('matches')
        .update({ available_seats: newSeatCount })
        .eq('id', selectedMatch.id);

      if (updateError) {
        console.error('Error updating seats:', updateError);
        alert('Seat update failed: ' + updateError.message);
        return;
      }

      // 3. Optimistically update local UI state if realtime has network latency
      setMatches((prevMatches) =>
        prevMatches.map((m) =>
          m.id === selectedMatch.id
            ? { ...m, available_seats: newSeatCount, availableSeats: newSeatCount }
            : m
        )
      );
      setTotalBookings((prev) => prev + 1);
    } catch (err) {
      console.error('Unexpected error during booking:', err);
    }
  };

  return (
    <div className="app-container">
      <Navbar totalBookings={totalBookings} />

      <main className="main-content">
        <Hero />

        <section className="matches-section">
          <h2>Upcoming Matches</h2>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading live matches from Supabase...</p>
          ) : statusMessage ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#dc2626' }}>
              <p>{statusMessage}</p>
            </div>
          ) : (
            <div className="matches-grid">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onSelectMatch={handleSelectMatch}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
