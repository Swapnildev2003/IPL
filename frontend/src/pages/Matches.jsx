import { useState, useEffect } from 'react';
import { getMatches } from '../api';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

function Matches() {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchMatches = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getMatches({ page, limit: 12 });
            setMatches(data.data || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            console.error('Failed to fetch matches:', err);
            setError('Failed to load matches. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [page]);

    const formatDate = (dateString) => {
        if (!dateString) return 'TBD';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getInningsScore = (match, teamId) => {
        // Find innings for this team
        if (!match.innings) return null;
        const innings = match.innings?.find((inn) => inn.battingTeamId === teamId);
        if (!innings) return null;
        return `${innings.totalRuns || 0}/${innings.totalWickets || 0}`;
    };

    if (loading && matches.length === 0) {
        return <Loading message="Loading matches..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchMatches} />;
    }

    if (matches.length === 0) {
        return (
            <EmptyState
                icon="🏆"
                title="No matches found"
                description="There are no matches in the database yet."
            />
        );
    }

    return (
        <div className="fade-in">
            {/* Page Header */}
            <header className="page-header">
                <h1 className="page-header__title">
                    <span>🏆</span> Matches
                </h1>
                <p className="page-header__subtitle">
                    IPL 2022 Match Results & Scorecards
                </p>
            </header>

            {/* Matches Grid */}
            <div className="grid-2">
                {matches.map((match) => (
                    <div key={match.id} className="match-card">
                        {/* Header */}
                        <div className="match-card__header">
                            <span className="match-card__date">
                                📅 {formatDate(match.dateStart)}
                            </span>
                            <span className={`match-card__status match-card__status--completed`}>
                                {match.status || 'Completed'}
                            </span>
                        </div>

                        {/* Match Number & Venue */}
                        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {match.matchNumber || match.shortTitle}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                📍 {match.venue?.name?.split(',')[0] || 'Unknown Venue'}
                            </span>
                        </div>

                        {/* Teams */}
                        <div className="match-card__teams">
                            {/* Team A */}
                            <div className="match-card__team">
                                <div
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px',
                                    }}
                                >
                                    {match.teamA?.logoUrl ? (
                                        <img
                                            src={match.teamA.logoUrl}
                                            alt={match.teamA?.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = match.teamA?.abbreviation || '?';
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontWeight: 700 }}>{match.teamA?.abbreviation || '?'}</span>
                                    )}
                                </div>
                                <span className="match-card__team-name">{match.teamA?.abbreviation || 'TBD'}</span>
                                <span
                                    className="match-card__team-score"
                                    style={{
                                        color: match.winningTeamId === match.teamAId ? 'var(--success-500)' : 'var(--text-secondary)'
                                    }}
                                >
                                    {getInningsScore(match, match.teamAId) || '-'}
                                </span>
                            </div>

                            {/* VS */}
                            <div className="match-card__vs">VS</div>

                            {/* Team B */}
                            <div className="match-card__team">
                                <div
                                    style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px',
                                    }}
                                >
                                    {match.teamB?.logoUrl ? (
                                        <img
                                            src={match.teamB.logoUrl}
                                            alt={match.teamB?.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = match.teamB?.abbreviation || '?';
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontWeight: 700 }}>{match.teamB?.abbreviation || '?'}</span>
                                    )}
                                </div>
                                <span className="match-card__team-name">{match.teamB?.abbreviation || 'TBD'}</span>
                                <span
                                    className="match-card__team-score"
                                    style={{
                                        color: match.winningTeamId === match.teamBId ? 'var(--success-500)' : 'var(--text-secondary)'
                                    }}
                                >
                                    {getInningsScore(match, match.teamBId) || '-'}
                                </span>
                            </div>
                        </div>

                        {/* Result */}
                        {match.result && (
                            <div className="match-card__result">
                                🏆 {match.result}
                            </div>
                        )}

                        {/* Man of the Match */}
                        {match.manOfTheMatch && (
                            <div style={{
                                marginTop: 'var(--space-3)',
                                textAlign: 'center',
                                fontSize: '0.8125rem',
                                color: 'var(--accent-400)'
                            }}>
                                ⭐ MoM: {match.manOfTheMatch.shortName || match.manOfTheMatch.title}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="pagination__btn"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        ← Prev
                    </button>
                    <span className="pagination__info">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="pagination__btn"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

export default Matches;
