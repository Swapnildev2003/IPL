import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTeams, getStandings } from '../api';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

function Teams() {
    const [teams, setTeams] = useState([]);
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [teamsData, standingsData] = await Promise.all([
                getTeams({ limit: 20 }),
                getStandings(),
            ]);

            setTeams(teamsData.data || []);
            setStandings(standingsData || []);
        } catch (err) {
            console.error('Failed to fetch teams:', err);
            setError('Failed to load teams data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <Loading message="Loading teams..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchData} />;
    }

    if (teams.length === 0) {
        return (
            <EmptyState
                icon="🏏"
                title="No teams found"
                description="There are no teams in the database yet."
            />
        );
    }

    // Merge standings data with teams
    const teamsWithStandings = teams.map((team) => {
        const standing = standings.find((s) => s.teamId === team.id);
        return { ...team, standing };
    });

    // Sort by points (descending)
    teamsWithStandings.sort((a, b) => {
        const pointsA = a.standing?.points || 0;
        const pointsB = b.standing?.points || 0;
        return pointsB - pointsA;
    });

    return (
        <div className="fade-in">
            {/* Page Header */}
            <header className="page-header">
                <h1 className="page-header__title">
                    <span>🏏</span> Teams
                </h1>
                <p className="page-header__subtitle">
                    IPL 2022 Franchise Teams & Points Table
                </p>
            </header>

            {/* View Toggle */}
            <div className="search-bar">
                <div className="filter-group">
                    <button
                        className={`filter-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                    >
                        📋 Table View
                    </button>
                    <button
                        className={`filter-btn ${viewMode === 'cards' ? 'active' : ''}`}
                        onClick={() => setViewMode('cards')}
                    >
                        🔲 Card View
                    </button>
                </div>
            </div>

            {/* Points Table View */}
            {viewMode === 'table' && (
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">📊 Points Table</h3>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th>Team</th>
                                    <th style={{ textAlign: 'center' }}>P</th>
                                    <th style={{ textAlign: 'center' }}>W</th>
                                    <th style={{ textAlign: 'center' }}>L</th>
                                    <th style={{ textAlign: 'center' }}>NR</th>
                                    <th style={{ textAlign: 'center' }}>NRR</th>
                                    <th style={{ textAlign: 'center' }}>Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamsWithStandings.map((team, index) => (
                                    <tr key={team.id}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {index + 1}
                                        </td>
                                        <td>
                                            <Link to={`/teams/${team.id}`} className="table__team">
                                                {team.logoUrl ? (
                                                    <img
                                                        src={team.logoUrl}
                                                        alt={team.title}
                                                        className="table__team-logo"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="table__team-logo"
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'var(--gradient-primary)',
                                                            color: 'white',
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {team.abbreviation?.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="table__team-name">{team.title}</span>
                                                    <span
                                                        style={{
                                                            display: 'block',
                                                            fontSize: '0.75rem',
                                                            color: 'var(--text-muted)',
                                                        }}
                                                    >
                                                        {team.abbreviation}
                                                    </span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {team.standing?.played || 0}
                                        </td>
                                        <td style={{ textAlign: 'center', color: 'var(--success-500)', fontWeight: 600 }}>
                                            {team.standing?.wins || 0}
                                        </td>
                                        <td style={{ textAlign: 'center', color: 'var(--error-500)' }}>
                                            {team.standing?.losses || 0}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {team.standing?.noResult || 0}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            {team.standing?.netRunRate?.toFixed(3) || '0.000'}
                                        </td>
                                        <td
                                            style={{
                                                textAlign: 'center',
                                                fontWeight: 700,
                                                fontSize: '1.125rem',
                                                color: 'var(--primary-400)',
                                            }}
                                        >
                                            {team.standing?.points || 0}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Cards View */}
            {viewMode === 'cards' && (
                <div className="grid-3">
                    {teamsWithStandings.map((team, index) => (
                        <Link
                            to={`/teams/${team.id}`}
                            key={team.id}
                            className="card card--glow"
                            style={{ cursor: 'pointer' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                <div
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: 'var(--radius-md)',
                                        background: 'rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px',
                                    }}
                                >
                                    {team.logoUrl ? (
                                        <img
                                            src={team.logoUrl}
                                            alt={team.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            onError={(e) => {
                                                e.target.parentElement.innerHTML = team.abbreviation;
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{team.abbreviation}</span>
                                    )}
                                </div>
                                <div>
                                    <h4 style={{ marginBottom: 'var(--space-1)' }}>{team.title}</h4>
                                    <span className="table__badge table__badge--primary">#{index + 1}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', textAlign: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                                        {team.standing?.points || 0}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pts</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-500)' }}>
                                        {team.standing?.wins || 0}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Won</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error-500)' }}>
                                        {team.standing?.losses || 0}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lost</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                        {team.standing?.netRunRate?.toFixed(2) || '0.00'}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>NRR</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Teams;
