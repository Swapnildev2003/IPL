import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

/**
 * @swagger
 * /api/stats/standings:
 *   get:
 *     summary: Get points table/standings
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: round
 *         schema:
 *           type: string
 *         description: Filter by round
 *     responses:
 *       200:
 *         description: Team standings
 */
router.get('/standings', async (req, res) => {
    try {
        const { round } = req.query;

        const where = round ? { round } : {};

        const standings = await prisma.standing.findMany({
            where,
            include: {
                team: true
            },
            orderBy: [
                { points: 'desc' },
                { netRunRate: 'desc' }
            ]
        });

        res.json(standings);
    } catch (error) {
        console.error('Error fetching standings:', error);
        res.status(500).json({ error: 'Failed to fetch standings' });
    }
});

/**
 * @swagger
 * /api/stats/top-batsmen:
 *   get:
 *     summary: Get top run scorers
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of players to return
 *     responses:
 *       200:
 *         description: Top batsmen by runs
 */
router.get('/top-batsmen', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const topBatsmen = await prisma.battingPerformance.groupBy({
            by: ['playerId'],
            _sum: {
                runs: true,
                fours: true,
                sixes: true,
                ballsFaced: true
            },
            _count: true,
            _max: {
                runs: true
            },
            orderBy: {
                _sum: {
                    runs: 'desc'
                }
            },
            take: limit
        });

        console.log("topBatsmen", topBatsmen)

        // Get player details
        const playerIds = topBatsmen.map(b => b.playerId);
        console.log(playerIds)
        const players = await prisma.player.findMany({
            where: { id: { in: playerIds } },
            include: {
                teams: {
                    include: { team: true }
                }
            }
        });

        console.log("gand", players)

        const result = topBatsmen.map(stat => {
            const player = players.find(p => p.id === stat.playerId);
            const totalRuns = stat._sum.runs || 0;
            const ballsFaced = stat._sum.ballsFaced || 0;

            return {
                player,
                stats: {
                    innings: stat._count,
                    runs: totalRuns,
                    highestScore: stat._max.runs || 0,
                    fours: stat._sum.fours || 0,
                    sixes: stat._sum.sixes || 0,
                    strikeRate: ballsFaced > 0 ? ((totalRuns / ballsFaced) * 100).toFixed(2) : 0,
                    average: stat._count > 0 ? (totalRuns / stat._count).toFixed(2) : 0
                }
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching top batsmen:', error);
        res.status(500).json({ error: 'Failed to fetch top batsmen' });
    }
});

/**
 * @swagger
 * /api/stats/top-bowlers:
 *   get:
 *     summary: Get top wicket takers
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of players to return
 *     responses:
 *       200:
 *         description: Top bowlers by wickets
 */
router.get('/top-bowlers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const topBowlers = await prisma.bowlingPerformance.groupBy({
            by: ['playerId'],
            _sum: {
                wickets: true,
                runsConceded: true,
                maidens: true
            },
            _count: true,
            _max: {
                wickets: true
            },
            orderBy: {
                _sum: {
                    wickets: 'desc'
                }
            },
            take: limit
        });

        // Get player details
        const playerIds = topBowlers.map(b => b.playerId);
        const players = await prisma.player.findMany({
            where: { id: { in: playerIds } },
            include: {
                teams: {
                    include: { team: true }
                }
            }
        });

        const result = topBowlers.map(stat => {
            const player = players.find(p => p.id === stat.playerId);
            const wickets = stat._sum.wickets || 0;
            const runsConceded = stat._sum.runsConceded || 0;

            return {
                player,
                stats: {
                    innings: stat._count,
                    wickets,
                    bestFigures: stat._max.wickets || 0,
                    runsConceded,
                    maidens: stat._sum.maidens || 0,
                    average: wickets > 0 ? (runsConceded / wickets).toFixed(2) : '-'
                }
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching top bowlers:', error);
        res.status(500).json({ error: 'Failed to fetch top bowlers' });
    }
});

/**
 * @swagger
 * /api/stats/summary:
 *   get:
 *     summary: Get tournament summary statistics
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Tournament overview stats
 */
router.get('/summary', async (req, res) => {
    try {
        const [
            totalMatches,
            totalTeams,
            totalPlayers,
            totalRuns,
            totalWickets,
            highestScore,
            mostWickets
        ] = await Promise.all([
            prisma.match.count(),
            prisma.team.count(),
            prisma.player.count(),
            prisma.battingPerformance.aggregate({
                _sum: { runs: true }
            }),
            prisma.bowlingPerformance.aggregate({
                _sum: { wickets: true }
            }),
            prisma.battingPerformance.findFirst({
                orderBy: { runs: 'desc' },
                include: {
                    player: true,
                    innings: {
                        include: { match: true }
                    }
                }
            }),
            prisma.bowlingPerformance.findFirst({
                orderBy: { wickets: 'desc' },
                include: {
                    player: true,
                    innings: {
                        include: { match: true }
                    }
                }
            })
        ]);

        res.json({
            overview: {
                totalMatches,
                totalTeams,
                totalPlayers,
                totalRuns: totalRuns._sum.runs || 0,
                totalWickets: totalWickets._sum.wickets || 0
            },
            records: {
                highestIndividualScore: highestScore ? {
                    runs: highestScore.runs,
                    player: highestScore.player?.title,
                    match: highestScore.innings?.match?.shortTitle
                } : null,
                bestBowlingFigures: mostWickets ? {
                    wickets: mostWickets.wickets,
                    player: mostWickets.player?.title,
                    match: mostWickets.innings?.match?.shortTitle
                } : null
            }
        });
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

/**
 * @swagger
 * /api/stats/team-performance:
 *   get:
 *     summary: Get team performance comparison
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Team performance metrics
 */
router.get('/team-performance', async (req, res) => {
    try {
        const teams = await prisma.team.findMany({
            include: {
                standings: {
                    orderBy: { round: 'desc' },
                    take: 1
                },
                wonMatches: {
                    select: { id: true }
                },
                homeMatches: {
                    select: { id: true }
                },
                awayMatches: {
                    select: { id: true }
                }
            }
        });

        const performance = teams.map(team => ({
            id: team.id,
            name: team.title,
            abbreviation: team.abbreviation,
            logoUrl: team.logoUrl,
            matchesPlayed: team.homeMatches.length + team.awayMatches.length,
            matchesWon: team.wonMatches.length,
            winPercentage: team.homeMatches.length + team.awayMatches.length > 0
                ? ((team.wonMatches.length / (team.homeMatches.length + team.awayMatches.length)) * 100).toFixed(1)
                : 0,
            standing: team.standings[0] || null
        }));

        res.json(performance.sort((a, b) => b.winPercentage - a.winPercentage));
    } catch (error) {
        console.error('Error fetching team performance:', error);
        res.status(500).json({ error: 'Failed to fetch team performance' });
    }
});

export default router;
