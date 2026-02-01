import express from 'express';
import prisma from '../lib/prisma.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         tid:
 *           type: integer
 *         title:
 *           type: string
 *         abbreviation:
 *           type: string
 *         logoUrl:
 *           type: string
 *         country:
 *           type: string
 */

/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
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
 *     responses:
 *       200:
 *         description: List of teams
 */
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [teams, total] = await Promise.all([
            prisma.team.findMany({
                skip,
                take: limit,
                orderBy: { title: 'asc' }
            }),
            prisma.team.count()
        ]);

        res.json({
            data: teams,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Team details
 *       404:
 *         description: Team not found
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const team = await prisma.team.findUnique({
            where: { id: parseInt(id) },
            include: {
                players: {
                    include: {
                        player: true
                    }
                },
                standings: {
                    orderBy: { round: 'desc' },
                    take: 1
                }
            }
        });

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json(team);
    } catch (error) {
        console.error('Error fetching team:', error);
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});

/**
 * @swagger
 * /api/teams/{id}/matches:
 *   get:
 *     summary: Get matches for a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of team matches
 */
router.get('/:id/matches', async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const teamId = parseInt(id);

        const [matches, total] = await Promise.all([
            prisma.match.findMany({
                where: {
                    OR: [
                        { teamAId: teamId },
                        { teamBId: teamId }
                    ]
                },
                include: {
                    teamA: true,
                    teamB: true,
                    venue: true,
                    winningTeam: true
                },
                orderBy: { dateStart: 'desc' },
                skip,
                take: limit
            }),
            prisma.match.count({
                where: {
                    OR: [
                        { teamAId: teamId },
                        { teamBId: teamId }
                    ]
                }
            })
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
        console.error('Error fetching team matches:', error);
        res.status(500).json({ error: 'Failed to fetch team matches' });
    }
});

/**
 * @swagger
 * /api/teams/{id}/players:
 *   get:
 *     summary: Get players for a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of team players
 */
router.get('/:id/players', async (req, res) => {
    try {
        const { id } = req.params;

        const teamPlayers = await prisma.teamPlayer.findMany({
            where: { teamId: parseInt(id) },
            include: {
                player: true
            }
        });

        const players = teamPlayers.map(tp => ({

            ...tp.player,
            role: tp.role,
            roleStr: tp.roleStr
        }));

        res.json(players);
    } catch (error) {
        console.error('Error fetching team players:', error);
        res.status(500).json({ error: 'Failed to fetch team players' });
    }
});

export default router;
