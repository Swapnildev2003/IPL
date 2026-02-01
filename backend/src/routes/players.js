import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Get all players
 *     tags: [Players]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [bat, bowl, all, wk]
 *         description: Filter by playing role
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filter by country code
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by player name
 *     responses:
 *       200:
 *         description: List of players
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { role, country, search } = req.query;

        const where = {};

        if (role) {
            where.playingRole = role;
        }

        if (country) {
            where.country = country;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { shortName: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [players, total] = await Promise.all([
            prisma.player.findMany({
                where,
                skip,
                take: limit,
                orderBy: { title: 'asc' }
            }),
            prisma.player.count({ where })
        ]);

        res.json({
            data: players,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching players:', error);
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Get player by ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Player details with stats
 *       404:
 *         description: Player not found
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const player = await prisma.player.findUnique({
            where: { id: parseInt(id) },
            include: {
                teams: {
                    include: {
                        team: true
                    }
                },
                battingPerformances: {
                    include: {
                        innings: {
                            include: {
                                match: true
                            }
                        }
                    },
                    orderBy: {
                        innings: {
                            match: {
                                dateStart: 'desc'
                            }
                        }
                    },
                    take: 10
                },
                bowlingPerformances: {
                    include: {
                        innings: {
                            include: {
                                match: true
                            }
                        }
                    },
                    orderBy: {
                        innings: {
                            match: {
                                dateStart: 'desc'
                            }
                        }
                    },
                    take: 10
                }
            }
        });

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        // Calculate aggregated stats
        const battingStats = await prisma.battingPerformance.aggregate({
            where: { playerId: parseInt(id) },
            _sum: {
                runs: true,
                ballsFaced: true,
                fours: true,
                sixes: true
            },
            _count: true,
            _max: {
                runs: true
            }
        });

        const bowlingStats = await prisma.bowlingPerformance.aggregate({
            where: { playerId: parseInt(id) },
            _sum: {
                wickets: true,
                runsConceded: true,
                maidens: true
            },
            _count: true,
            _max: {
                wickets: true
            }
        });

        res.json({
            ...player,
            aggregatedStats: {
                batting: {
                    innings: battingStats._count,
                    totalRuns: battingStats._sum.runs || 0,
                    highestScore: battingStats._max.runs || 0,
                    fours: battingStats._sum.fours || 0,
                    sixes: battingStats._sum.sixes || 0,
                    ballsFaced: battingStats._sum.ballsFaced || 0
                },
                bowling: {
                    innings: bowlingStats._count,
                    totalWickets: bowlingStats._sum.wickets || 0,
                    bestFigures: bowlingStats._max.wickets || 0,
                    runsConceded: bowlingStats._sum.runsConceded || 0,
                    maidens: bowlingStats._sum.maidens || 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({ error: 'Failed to fetch player' });
    }
});

/**
 * @swagger
 * /api/players/{id}/batting:
 *   get:
 *     summary: Get player batting performances
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Batting performances
 */
router.get('/:id/batting', async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [performances, total] = await Promise.all([
            prisma.battingPerformance.findMany({
                where: { playerId: parseInt(id) },
                include: {
                    innings: {
                        include: {
                            match: {
                                include: {
                                    teamA: true,
                                    teamB: true
                                }
                            },
                            battingTeam: true
                        }
                    }
                },
                orderBy: {
                    innings: {
                        match: {
                            dateStart: 'desc'
                        }
                    }
                },
                skip,
                take: limit
            }),
            prisma.battingPerformance.count({
                where: { playerId: parseInt(id) }
            })
        ]);

        res.json({
            data: performances,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching batting performances:', error);
        res.status(500).json({ error: 'Failed to fetch batting performances' });
    }
});

/**
 * @swagger
 * /api/players/{id}/bowling:
 *   get:
 *     summary: Get player bowling performances
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bowling performances
 */
router.get('/:id/bowling', async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [performances, total] = await Promise.all([
            prisma.bowlingPerformance.findMany({
                where: { playerId: parseInt(id) },
                include: {
                    innings: {
                        include: {
                            match: {
                                include: {
                                    teamA: true,
                                    teamB: true
                                }
                            },
                            fieldingTeam: true
                        }
                    }
                },
                orderBy: {
                    innings: {
                        match: {
                            dateStart: 'desc'
                        }
                    }
                },
                skip,
                take: limit
            }),
            prisma.bowlingPerformance.count({
                where: { playerId: parseInt(id) }
            })
        ]);

        res.json({
            data: performances,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching bowling performances:', error);
        res.status(500).json({ error: 'Failed to fetch bowling performances' });
    }
});

export default router;
