import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const DATA_PATH = path.join(__dirname, '../../data/Indian_Premier_League_2022-03-26');

// Helper to read JSON file
const readJSON = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return null;
    }
};

// Seed Teams
const seedTeams = async () => {
    console.log('Seeding teams...');
    const teamsData = readJSON(path.join(DATA_PATH, 'teams/teams.json'));

    if (!teamsData) return;

    for (const team of teamsData) {
        await prisma.team.upsert({
            where: { tid: team.tid },
            update: {},
            create: {
                tid: team.tid,
                title: team.title,
                abbreviation: team.abbr || team.title.substring(0, 3).toUpperCase(),
                logoUrl: team.logo_url || null,
                thumbUrl: team.thumb_url || null,
                country: team.country || 'in',
                sex: team.sex || 'male'
            }
        });
    }
    console.log(`Seeded ${teamsData.length} teams`);
};

// Seed Players from squads
const seedPlayers = async () => {
    console.log('Seeding players...');
    const squadsData = readJSON(path.join(DATA_PATH, 'squads/squads.json'));

    if (!squadsData) return;

    const seenPlayers = new Set();
    let playerCount = 0;

    for (const squad of squadsData) {
        // Get team from database
        const team = await prisma.team.findFirst({
            where: { tid: squad.team_id }
        });

        if (!team) {
            console.log(`Team not found for tid: ${squad.team_id}`);
            continue;
        }

        for (const player of squad.players) {
            // Skip if already processed
            if (seenPlayers.has(player.pid)) {
                // Just create team-player relationship
                await prisma.teamPlayer.upsert({
                    where: {
                        teamId_playerId: {
                            teamId: team.id,
                            playerId: (await prisma.player.findUnique({ where: { pid: player.pid } }))?.id || 0
                        }
                    },
                    update: {},
                    create: {
                        teamId: team.id,
                        playerId: (await prisma.player.findUnique({ where: { pid: player.pid } }))?.id || 0,
                        role: player.playing_role || null,
                        roleStr: player.role_str || null
                    }
                }).catch(() => { });
                continue;
            }

            seenPlayers.add(player.pid);

            // Create player
            const createdPlayer = await prisma.player.upsert({
                where: { pid: player.pid },
                update: {},
                create: {
                    pid: player.pid,
                    title: player.title,
                    shortName: player.short_name || null,
                    firstName: player.first_name || null,
                    lastName: player.last_name || null,
                    middleName: player.middle_name || null,
                    birthdate: player.birthdate || null,
                    birthplace: player.birthplace || null,
                    country: player.country || null,
                    playingRole: player.playing_role || null,
                    battingStyle: player.batting_style || null,
                    bowlingStyle: player.bowling_style || null,
                    fieldingPosition: player.fielding_position || null,
                    nationality: player.nationality || null,
                    thumbUrl: player.thumb_url || null,
                    logoUrl: player.logo_url || null,
                    fantasyRating: player.fantasy_player_rating || null
                }
            });

            // Create team-player relationship
            await prisma.teamPlayer.upsert({
                where: {
                    teamId_playerId: {
                        teamId: team.id,
                        playerId: createdPlayer.id
                    }
                },
                update: {},
                create: {
                    teamId: team.id,
                    playerId: createdPlayer.id,
                    role: player.playing_role || null,
                    roleStr: null
                }
            }).catch(() => { });

            playerCount++;
        }
    }
    console.log(`Seeded ${playerCount} players`);
};

// Seed Venues and Matches
const seedMatches = async () => {
    console.log('Seeding venues and matches...');
    const matchesData = readJSON(path.join(DATA_PATH, 'matches/matches.json'));

    if (!matchesData) return;

    const seenVenues = new Set();
    let matchCount = 0;

    for (const match of matchesData) {
        // Create venue if not exists
        if (match.venue && match.venue.venue_id && !seenVenues.has(match.venue.venue_id)) {
            await prisma.venue.upsert({
                where: { venueId: String(match.venue.venue_id) },
                update: {},
                create: {
                    venueId: String(match.venue.venue_id),
                    name: match.venue.name,
                    location: match.venue.location || null,
                    country: match.venue.country || null,
                    timezone: match.venue.timezone || null
                }
            });
            seenVenues.add(match.venue.venue_id);
        }

        // Get team IDs
        const teamA = match.teama ? await prisma.team.findFirst({ where: { tid: match.teama.team_id } }) : null;
        const teamB = match.teamb ? await prisma.team.findFirst({ where: { tid: match.teamb.team_id } }) : null;
        const venue = match.venue ? await prisma.venue.findFirst({ where: { venueId: String(match.venue.venue_id) } }) : null;
        const winningTeam = match.winning_team_id ? await prisma.team.findFirst({ where: { tid: match.winning_team_id } }) : null;
        const tossWinner = match.toss?.winner ? await prisma.team.findFirst({ where: { tid: match.toss.winner } }) : null;
        const manOfMatch = match.man_of_the_match?.pid ? await prisma.player.findFirst({ where: { pid: match.man_of_the_match.pid } }) : null;

        // Create match
        await prisma.match.upsert({
            where: { matchId: match.match_id },
            update: {},
            create: {
                matchId: match.match_id,
                title: match.title,
                shortTitle: match.short_title || null,
                subtitle: match.subtitle || null,
                matchNumber: match.match_number || null,
                format: match.format_str || 'T20',
                status: match.status_str || null,
                statusNote: match.status_note || null,
                dateStart: match.date_start ? new Date(match.date_start) : null,
                dateEnd: match.date_end ? new Date(match.date_end) : null,
                result: match.result || null,
                winMargin: match.win_margin || null,
                tossText: match.toss?.text || null,
                tossDecision: match.toss?.decision === 1 ? 'bat' : match.toss?.decision === 2 ? 'bowl' : null,
                umpires: match.umpires || null,
                referee: match.referee || null,
                teamAId: teamA?.id || null,
                teamBId: teamB?.id || null,
                venueId: venue?.id || null,
                winningTeamId: winningTeam?.id || null,
                tossWinnerId: tossWinner?.id || null,
                manOfTheMatchId: manOfMatch?.id || null
            }
        });

        matchCount++;
    }
    console.log(`Seeded ${matchCount} matches`);
};

// Seed Scorecards (innings and performances)
const seedScorecards = async () => {
    console.log('Seeding scorecards...');
    const scorecardsDir = path.join(DATA_PATH, 'scorecards');

    if (!fs.existsSync(scorecardsDir)) {
        console.log('Scorecards directory not found');
        return;
    }

    const files = fs.readdirSync(scorecardsDir).filter(f => f.endsWith('.json'));
    let inningsCount = 0;

    for (const file of files) {
        const scorecard = readJSON(path.join(scorecardsDir, file));
        if (!scorecard || !scorecard.innings) continue;

        const match = await prisma.match.findFirst({ where: { matchId: scorecard.match_id } });
        if (!match) continue;

        for (const inning of scorecard.innings) {
            const battingTeam = await prisma.team.findFirst({ where: { tid: inning.batting_team_id } });
            const fieldingTeam = await prisma.team.findFirst({ where: { tid: inning.fielding_team_id } });

            // Parse scores
            const scores = inning.scores?.split('/') || ['0', '0'];
            const totalRuns = parseInt(scores[0]) || 0;
            const totalWickets = parseInt(scores[1]) || 0;

            // Create innings
            const createdInnings = await prisma.innings.upsert({
                where: { iid: inning.iid },
                update: {},
                create: {
                    iid: inning.iid,
                    matchId: match.id,
                    inningsNumber: inning.number,
                    name: inning.name || null,
                    shortName: inning.short_name || null,
                    status: inning.status || null,
                    totalRuns,
                    totalWickets,
                    totalOvers: inning.equations?.overs || inning.overs || null,
                    runRate: parseFloat(inning.equations?.runrate) || null,
                    target: parseInt(inning.target) || null,
                    extrasByes: inning.extra_runs?.byes || 0,
                    extrasLegByes: inning.extra_runs?.legbyes || 0,
                    extrasWides: inning.extra_runs?.wides || 0,
                    extrasNoBalls: inning.extra_runs?.noballs || 0,
                    extrasTotal: inning.extra_runs?.total || 0,
                    battingTeamId: battingTeam?.id || null,
                    fieldingTeamId: fieldingTeam?.id || null
                }
            });

            // Create batting performances
            if (inning.batsmen) {
                let position = 1;
                for (const batsman of inning.batsmen) {
                    const player = await prisma.player.findFirst({ where: { pid: parseInt(batsman.batsman_id) } });
                    if (!player) continue;

                    const bowler = batsman.bowler_id && batsman.bowler_id !== '0'
                        ? await prisma.player.findFirst({ where: { pid: parseInt(batsman.bowler_id) } })
                        : null;

                    await prisma.battingPerformance.upsert({
                        where: {
                            inningsId_playerId: {
                                inningsId: createdInnings.id,
                                playerId: player.id
                            }
                        },
                        update: {},
                        create: {
                            inningsId: createdInnings.id,
                            playerId: player.id,
                            runs: parseInt(batsman.runs) || 0,
                            ballsFaced: parseInt(batsman.balls_faced) || 0,
                            fours: parseInt(batsman.fours) || 0,
                            sixes: parseInt(batsman.sixes) || 0,
                            strikeRate: parseFloat(batsman.strike_rate) || null,
                            howOut: batsman.how_out || null,
                            dismissal: batsman.dismissal || null,
                            position: position++,
                            bowlerId: bowler?.id || null
                        }
                    }).catch(() => { });
                }
            }

            // Create bowling performances
            if (inning.bowlers) {
                for (const bowler of inning.bowlers) {
                    const player = await prisma.player.findFirst({ where: { pid: parseInt(bowler.bowler_id) } });
                    if (!player) continue;

                    await prisma.bowlingPerformance.upsert({
                        where: {
                            inningsId_playerId: {
                                inningsId: createdInnings.id,
                                playerId: player.id
                            }
                        },
                        update: {},
                        create: {
                            inningsId: createdInnings.id,
                            playerId: player.id,
                            overs: bowler.overs || null,
                            maidens: parseInt(bowler.maidens) || 0,
                            runsConceded: parseInt(bowler.runs_conceded) || 0,
                            wickets: parseInt(bowler.wickets) || 0,
                            economy: parseFloat(bowler.econ) || null,
                            noBalls: parseInt(bowler.noballs) || 0,
                            wides: parseInt(bowler.wides) || 0,
                            dotBalls: parseInt(bowler.run0) || 0
                        }
                    }).catch(() => { });
                }
            }

            inningsCount++;
        }
    }
    console.log(`Seeded ${inningsCount} innings with performances`);
};

// Seed Standings
const seedStandings = async () => {
    console.log('Seeding standings...');
    const standingsData = readJSON(path.join(DATA_PATH, 'standings/standings.json'));

    if (!standingsData || !standingsData.standings) return;

    let count = 0;
    for (const roundData of standingsData.standings) {
        const round = roundData.round?.name || 'Final';

        for (const standing of roundData.standings) {
            const team = await prisma.team.findFirst({ where: { tid: parseInt(standing.team_id) } });
            if (!team) continue;

            await prisma.standing.upsert({
                where: {
                    teamId_round: {
                        teamId: team.id,
                        round
                    }
                },
                update: {
                    played: parseInt(standing.played) || 0,
                    wins: parseInt(standing.win) || 0,
                    losses: parseInt(standing.loss) || 0,
                    ties: parseInt(standing.tied) || 0,
                    noResult: parseInt(standing.nr) || 0,
                    points: parseInt(standing.points) || 0,
                    netRunRate: parseFloat(standing.netrr) || null,
                    position: parseInt(standing.position) || null
                },
                create: {
                    teamId: team.id,
                    round,
                    played: parseInt(standing.played) || 0,
                    wins: parseInt(standing.win) || 0,
                    losses: parseInt(standing.loss) || 0,
                    ties: parseInt(standing.tied) || 0,
                    noResult: parseInt(standing.nr) || 0,
                    points: parseInt(standing.points) || 0,
                    netRunRate: parseFloat(standing.netrr) || null,
                    position: parseInt(standing.position) || null
                }
            });
            count++;
        }
    }
    console.log(`Seeded ${count} standings`);
};

// Main seed function
const main = async () => {
    console.log('Starting database seed...\n');

    try {
        await seedTeams();
        await seedPlayers();
        await seedMatches();
        await seedScorecards();
        await seedStandings();

        console.log('\nDatabase seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
};

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
