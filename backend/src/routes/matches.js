import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Matches]
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
 *         name: teamId
 *         schema:
 *           type: integer
 *         description: Filter by team ID
 *       - in: query
 *         name: venueId
 *         schema:
 *           type: integer
 *         description: Filter by venue ID
 *     responses:
 *       200:
 *         description: List of matches
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const { teamId, venueId } = req.query;

        const where = {};

        if (teamId) {
            const tid = parseInt(teamId);
            where.OR = [
                { teamAId: tid },
                { teamBId: tid }
            ];
        }

        if (venueId) {
            where.venueId = parseInt(venueId);
        }


        const [matches, total] = await Promise.all([

            // QUERY 1: Fetch paginated matches with related data
            prisma.match.findMany({
                where,              // Filter conditions (empty = no filter)
                include: {          // JOIN related tables to get full data
                    teamA: true,          // Get Team A details
                    teamB: true,          // Get Team B details
                    venue: true,          // Get Venue details
                    winningTeam: true,    // Get winning team details
                    manOfTheMatch: true   // Get player who won MoM
                },
                orderBy: { dateStart: 'desc' },  // Sort: newest matches first
                skip,               // Skip N records (for pagination offset)
                take: limit         // Return only 'limit' number of records
            }),

            // QUERY 2: Count total matching records (for pagination metadata)
            // Uses same 'where' filter to get accurate total count
            prisma.match.count({ where })
        ]);

        res.json({
            data: matches,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get match by ID with full scorecard
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Match details with innings and performances
 *       404:
 *         description: Match not found
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const match = await prisma.match.findUnique({
            where: { id: parseInt(id) },
            include: {
                teamA: true,
                teamB: true,
                venue: true,
                winningTeam: true,
                tossWinner: true,
                manOfTheMatch: true,
                innings: {
                    include: {
                        battingTeam: true,
                        fieldingTeam: true,
                        battingPerformances: {
                            include: {
                                player: true,
                                bowler: true
                            },
                            orderBy: { position: 'asc' }
                        },
                        bowlingPerformances: {
                            include: {
                                player: true
                            }
                        }
                    },
                    orderBy: { inningsNumber: 'asc' }
                }
            }
        });

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        res.json(match);
    } catch (error) {
        console.error('Error fetching match:', error);
        res.status(500).json({ error: 'Failed to fetch match' });
    }
});

/**
 * @swagger
 * /api/matches/{id}/scorecard:
 *   get:
 *     summary: Get match scorecard
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Match scorecard with batting and bowling details
 */
router.get('/:id/scorecard', async (req, res) => {
    try {
        const { id } = req.params;

        const innings = await prisma.innings.findMany({
            where: { matchId: parseInt(id) },
            include: {
                battingTeam: true,
                fieldingTeam: true,
                battingPerformances: {
                    include: {
                        player: true,
                        bowler: true
                    },
                    orderBy: { position: 'asc' }
                },
                bowlingPerformances: {
                    include: {
                        player: true
                    },
                    orderBy: { wickets: 'desc' }
                }
            },
            orderBy: { inningsNumber: 'asc' }
        });

        if (innings.length === 0) {
            return res.status(404).json({ error: 'Scorecard not found' });
        }

        res.json(innings);
    } catch (error) {
        console.error('Error fetching scorecard:', error);
        res.status(500).json({ error: 'Failed to fetch scorecard' });
    }
});

/**
 * @swagger
 * /api/matches/venues:
 *   get:
 *     summary: Get all venues
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: List of venues
 */
router.get('/venues/list', async (req, res) => {
    try {
        const venues = await prisma.venue.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { matches: true }
                }
            }
        });

        res.json(venues);
    } catch (error) {
        console.error('Error fetching venues:', error);
        res.status(500).json({ error: 'Failed to fetch venues' });
    }
});

export default router;
