import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { getSummary, getTopBatsmen, getTeamPerformance } from '../api';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';

// Chart colors
const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#ef4444'];

function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [topBatsmen, setTopBatsmen] = useState([]);
    const [teamPerformance, setTeamPerformance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [summaryData, batsmenData, teamData] = await Promise.all([
                getSummary(),
                getTopBatsmen({ limit: 10 }),
                getTeamPerformance(),
            ]);

            setSummary(summaryData);
            setTopBatsmen(batsmenData);
            setTeamPerformance(teamData);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            setError('Failed to load dashboard data. Please check if the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <Loading message="Loading dashboard..." />;
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchData} />;
    }

    // Prepare chart data
    const batsmenChartData = topBatsmen.slice(0, 8).map((item) => ({
        name: item.player?.shortName || item.player?.title?.split(' ').pop() || 'Unknown',
        runs: item.stats?.runs || 0,
        avg: parseFloat(item.stats?.average) || 0,
    }));

    const teamWinsData = teamPerformance.map((team) => ({
        name: team.abbreviation,
        wins: team.matchesWon,
        played: team.matchesPlayed,
    }));

    return (
        <div className="fade-in">
            {/* Page Header */}
            <header className="page-header">
                <h1 className="page-header__title">
                    <span>📊</span> Dashboard
                </h1>
                <p className="page-header__subtitle">
                    IPL 2022 Season Overview & Statistics
                </p>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__icon">🏏</div>
                    <p className="stat-card__label">Total Matches</p>
                    <p className="stat-card__value">{summary?.overview?.totalMatches || 0}</p>
                </div>

                <div className="stat-card stat-card--accent">
                    <div className="stat-card__icon">🏆</div>
                    <p className="stat-card__label">Teams</p>
                    <p className="stat-card__value">{summary?.overview?.totalTeams || 0}</p>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon">👥</div>
                    <p className="stat-card__label">Players</p>
                    <p className="stat-card__value">{summary?.overview?.totalPlayers || 0}</p>
                </div>

                <div className="stat-card stat-card--accent">
                    <div className="stat-card__icon">🎯</div>
                    <p className="stat-card__label">Total Runs</p>
                    <p className="stat-card__value">{summary?.overview?.totalRuns?.toLocaleString() || 0}</p>
                </div>

                <div className="stat-card">
                    <div className="stat-card__icon">🎳</div>
                    <p className="stat-card__label">Total Wickets</p>
                    <p className="stat-card__value">{summary?.overview?.totalWickets || 0}</p>
                </div>
            </div>

            {/* Records Section */}
            {summary?.records && (
                <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
                    <div className="card card--glow">
                        <div className="card__header">
                            <h3 className="card__title">🏅 Highest Individual Score</h3>
                        </div>
                        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                            <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-400)', marginBottom: 'var(--space-2)' }}>
                                {summary.records.highestIndividualScore?.runs || '-'}
                            </p>
                            <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                {summary.records.highestIndividualScore?.player || 'N/A'}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {summary.records.highestIndividualScore?.match || ''}
                            </p>
                        </div>
                    </div>

                    <div className="card card--glow">
                        <div className="card__header">
                            <h3 className="card__title">🎳 Best Bowling Figures</h3>
                        </div>
                        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                            <p style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary-400)', marginBottom: 'var(--space-2)' }}>
                                {summary.records.bestBowlingFigures?.wickets || '-'} Wkts
                            </p>
                            <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-1)' }}>
                                {summary.records.bestBowlingFigures?.player || 'N/A'}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                {summary.records.bestBowlingFigures?.match || ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid-2">
                {/* Top Run Scorers Chart */}
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">📈 Top Run Scorers</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={batsmenChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis type="number" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={80}
                                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                    }}
                                    labelStyle={{ color: '#fafafa' }}
                                />
                                <Bar
                                    dataKey="runs"
                                    fill="url(#colorGradient)"
                                    radius={[0, 4, 4, 0]}
                                    name="Runs"
                                />
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Team Wins Chart */}
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">🏆 Team Wins Distribution</h3>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={teamWinsData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
                                    paddingAngle={2}
                                    dataKey="wins"
                                    nameKey="name"
                                    label={({ name, wins }) => `${name}: ${wins}`}
                                    labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                                >
                                    {teamWinsData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke="rgba(0,0,0,0.3)"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                    }}
                                    formatter={(value, name) => [`${value} wins`, name]}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: '12px' }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
