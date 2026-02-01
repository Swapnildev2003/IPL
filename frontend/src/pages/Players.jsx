import { useState, useEffect } from 'react';
import { getPlayers, getTopBatsmen, getTopBowlers } from '../api';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';

// Role mapping for display
const roleLabels = {
    bat: '🏏 Batsman',
    bowl: '🎳 Bowler',
    all: '⚡ All-rounder',
    wk: '🧤 Wicket-keeper',
};

function Players() {
    const [players, setPlayers] = useState([]);
    const [topBatsmen, setTopBatsmen] = useState([]);
    const [topBowlers, setTopBowlers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewTab, setViewTab] = useState('all'); // 'all', 'batsmen', 'bowlers'

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                limit: 12,
                ...(search && { search }),
                ...(roleFilter && { role: roleFilter }),
            };

            const data = await getPlayers(params);
            setPlayers(data.data || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err) {
            console.error('Failed to fetch players:', err);
            setError('Failed to load players. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboards = async () => {
        try {
            const [batsmenData, bowlersData] = await Promise.all([
                getTopBatsmen({ limit: 10 }),
                getTopBowlers({ limit: 10 }),
            ]);
            setTopBatsmen(batsmenData || []);
            setTopBowlers(bowlersData || []);
        } catch (err) {
            console.error('Failed to fetch leaderboards:', err);
        }
    };

    useEffect(() => {
        fetchLeaderboards();
    }, []);

    useEffect(() => {
        if (viewTab === 'all') {
            fetchPlayers();
        }
    }, [page, search, roleFilter, viewTab]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    };

    const handleRoleFilter = (role) => {
        setRoleFilter(role === roleFilter ? '' : role);
        setPage(1);
    };

    const renderPlayerCard = (player, stats = null) => (
        <div key={player?.id || Math.random()} className="player-card">
            <div className="player-card__avatar">
                {player?.shortName?.charAt(0) || player?.title?.charAt(0) || '?'}
            </div>
            <h4 className="player-card__name">{player?.title || 'Unknown'}</h4>
            <p className="player-card__role">
                {roleLabels[player?.playingRole] || player?.playingRole || 'Player'}
            </p>
            {player?.country && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                    📍 {player.country}
                </p>
            )}
            {stats && (
                <div className="player-card__stats">
                    {stats.runs !== undefined && (
                        <div className="player-card__stat">
                            <p className="player-card__stat-value">{stats.runs}</p>
                            <p className="player-card__stat-label">Runs</p>
                        </div>
                    )}
                    {stats.wickets !== undefined && (
                        <div className="player-card__stat">
                            <p className="player-card__stat-value">{stats.wickets}</p>
                            <p className="player-card__stat-label">Wkts</p>
                        </div>
                    )}
                    {stats.average !== undefined && (
                        <div className="player-card__stat">
                            <p className="player-card__stat-value">{stats.average}</p>
                            <p className="player-card__stat-label">Avg</p>
                        </div>
                    )}
                    {stats.strikeRate !== undefined && (
                        <div className="player-card__stat">
                            <p className="player-card__stat-value">{stats.strikeRate}</p>
                            <p className="player-card__stat-label">SR</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="fade-in">
            {/* Page Header */}
            <header className="page-header">
                <h1 className="page-header__title">
                    <span>👤</span> Players
                </h1>
                <p className="page-header__subtitle">
                    Browse IPL players and view top performers
                </p>
            </header>

            {/* Tabs */}
            <div className="search-bar" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="filter-group">
                    <button
                        className={`filter-btn ${viewTab === 'all' ? 'active' : ''}`}
                        onClick={() => setViewTab('all')}
                    >
                        👥 All Players
                    </button>
                    <button
                        className={`filter-btn ${viewTab === 'batsmen' ? 'active' : ''}`}
                        onClick={() => setViewTab('batsmen')}
                    >
                        🏏 Top Batsmen
                    </button>
                    <button
                        className={`filter-btn ${viewTab === 'bowlers' ? 'active' : ''}`}
                        onClick={() => setViewTab('bowlers')}
                    >
                        🎳 Top Bowlers
                    </button>
                </div>
            </div>

            {/* All Players Tab */}
            {viewTab === 'all' && (
                <>
                    {/* Search & Filters */}
                    <div className="search-bar">
                        <div className="search-wrapper">
                            <span className="search-wrapper__icon">🔍</span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search players..."
                                value={search}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="filter-group">
                            {['bat', 'bowl', 'all', 'wk'].map((role) => (
                                <button
                                    key={role}
                                    className={`filter-btn ${roleFilter === role ? 'active' : ''}`}
                                    onClick={() => handleRoleFilter(role)}
                                >
                                    {roleLabels[role]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <Loading message="Loading players..." />
                    ) : error ? (
                        <ErrorState message={error} onRetry={fetchPlayers} />
                    ) : players.length === 0 ? (
                        <EmptyState
                            icon="👤"
                            title="No players found"
                            description="No players match your search criteria."
                        />
                    ) : (
                        <>
                            <div className="grid-3">
                                {players.map((player) => renderPlayerCard(player))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        className="pagination__btn"
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        ←
                                    </button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                                        if (pageNum > totalPages) return null;
                                        return (
                                            <button
                                                key={pageNum}
                                                className={`pagination__btn ${page === pageNum ? 'active' : ''}`}
                                                onClick={() => setPage(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                    <button
                                        className="pagination__btn"
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Top Batsmen Tab */}
            {viewTab === 'batsmen' && (
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">🏏 Orange Cap Contenders</h3>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th>Player</th>
                                    <th style={{ textAlign: 'center' }}>Inns</th>
                                    <th style={{ textAlign: 'center' }}>Runs</th>
                                    <th style={{ textAlign: 'center' }}>HS</th>
                                    <th style={{ textAlign: 'center' }}>4s</th>
                                    <th style={{ textAlign: 'center' }}>6s</th>
                                    <th style={{ textAlign: 'center' }}>SR</th>
                                    <th style={{ textAlign: 'center' }}>Avg</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topBatsmen.map((item, index) => (
                                    <tr key={item.player?.id || index}>
                                        <td style={{ fontWeight: 600, color: index < 3 ? 'var(--accent-400)' : 'var(--text-primary)' }}>
                                            {index < 3 ? '🏅' : ''} {index + 1}
                                        </td>
                                        <td>
                                            <div className="table__team">
                                                <div
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: 'var(--gradient-accent)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {item.player?.shortName?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <span className="table__team-name">{item.player?.title || 'Unknown'}</span>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {item.player?.teams?.[0]?.team?.abbreviation || ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.innings || 0}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-400)', fontSize: '1.125rem' }}>
                                            {item.stats?.runs || 0}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.highestScore || 0}</td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.fours || 0}</td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.sixes || 0}</td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.strikeRate || '-'}</td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.average || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Top Bowlers Tab */}
            {viewTab === 'bowlers' && (
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">🎳 Purple Cap Contenders</h3>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>#</th>
                                    <th>Player</th>
                                    <th style={{ textAlign: 'center' }}>Inns</th>
                                    <th style={{ textAlign: 'center' }}>Wkts</th>
                                    <th style={{ textAlign: 'center' }}>Best</th>
                                    <th style={{ textAlign: 'center' }}>Runs</th>
                                    <th style={{ textAlign: 'center' }}>Maidens</th>
                                    <th style={{ textAlign: 'center' }}>Avg</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topBowlers.map((item, index) => (
                                    <tr key={item.player?.id || index}>
                                        <td style={{ fontWeight: 600, color: index < 3 ? 'var(--primary-400)' : 'var(--text-primary)' }}>
                                            {index < 3 ? '🎖️' : ''} {index + 1}
                                        </td>
                                        <td>
                                            <div className="table__team">
                                                <div
                                                    style={{
                                                        width: '36px',
                                                        height: '36px',
                                                        borderRadius: '50%',
                                                        background: 'var(--gradient-primary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    {item.player?.shortName?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <span className="table__team-name">{item.player?.title || 'Unknown'}</span>
                                                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        {item.player?.teams?.[0]?.team?.abbreviation || ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.innings || 0}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary-400)', fontSize: '1.125rem' }}>
                                            {item.stats?.wickets || 0}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.bestFigures || 0}</td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.runsConceded || 0}</td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.maidens || 0}</td>
                                        <td style={{ textAlign: 'center' }}>{item.stats?.average || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Players;
