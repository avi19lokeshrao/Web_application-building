export function MatchCard({ match, onSelectMatch }) {
  const seats = match.available_seats !== undefined ? match.available_seats : match.availableSeats;
  const isSoldOut = seats === 0;

  return (
    <article className="match-card">
      <h3>{match.team1} vs {match.team2}</h3>
      <p>{match.date} • {match.venue}</p>
      <p>₹{match.price} • {seats} seats left</p>
      <button disabled={isSoldOut} onClick={() => onSelectMatch(match)}>
        {isSoldOut ? 'Sold Out' : 'Book Tickets'}
      </button>
    </article>
  );
}
