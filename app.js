const puppeteer = require('puppeteer');
const express = require('express');
import('node-fetch');
const fs = require('fs');

const app = express();
app.use(express.static('public'));

const GAME_WIDTH = 560;
const GAME_HEIGHT = 176;
const GAME_TILE = 16;
const ROWS = GAME_HEIGHT / GAME_TILE;
const COLUMNS = GAME_WIDTH / GAME_TILE;
let debug = false;

const getGitHubProfile = async (user) => {
    let githubUrl = `https://api.github.com/users/${user}/followers`;

    try {
        const response = await fetch(githubUrl);

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error("Failed to fetch GitHub profile");
        }
    } catch (err) {
        console.log(err);
        throw new Error("Unable to connect to GitHub Web API");
    }
};

let LEVEL = [
    1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3,
    12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14,
    12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14,
    12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14,
    12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14,
    12, '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14,
    12, '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', '$', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14,
    12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14,
    12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14,
    12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14,
    23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25
];

// function getTile(map, col, row) {
//     return map[row * COLUMNS + col];
// }

async function updateLevelWithFollowers(user) {
    try {
        const followers = await getGitHubProfile(user);
        let followerIndex = 0;

        for (let i = 0; i < LEVEL.length; i++) {
            if (LEVEL[i] === 0 || LEVEL[i] === '$') {
                // Check if the space is empty and within bounds
                if (i % COLUMNS <= COLUMNS - 2 && i + COLUMNS <= LEVEL.length) {
                    // Fill the 2x2 space with follower's avatar
                    const avatarUrl = followers[followerIndex]?.avatar_url;
                    if (avatarUrl) {
                        LEVEL[i] = avatarUrl;
                        followerIndex++;
                    }
                }
            }
        }

        // If there are still followers remaining, add more '$' at the bottom
        while (followerIndex < followers.length) {
            for (let col = 0; col < COLUMNS - 1; col++) {
                if (LEVEL[(ROWS - 1) * COLUMNS + col] === 0) {
                    LEVEL[(ROWS - 1) * COLUMNS + col] = '$';
                }
            }
            followerIndex++;
        }
    } catch (error) {
        console.error(error);
    }
}

async function drawLevel(page) {
    await page.evaluate((LEVEL, debug) => {
        const GAME_WIDTH = 560;
        const GAME_HEIGHT = 176;
        const GAME_TILE = 16;
        const ROWS = GAME_HEIGHT / GAME_TILE;
        const COLUMNS = GAME_WIDTH / GAME_TILE;

        const drawTile = (ctx, x, y, tileUrl) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, x, y, GAME_TILE, GAME_TILE);
                    resolve();
                };
                img.onerror = reject;
                img.src = tileUrl;
            });
        };

        const drawLevel = async (LEVEL, debug) => {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');

            const TILE_MAP = document.getElementById('tilemap');

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let row = 0; row < ROWS; row++) {
                for (let col = 0; col < COLUMNS; col++) {
                    const tile = LEVEL[row * COLUMNS + col];
                    if (typeof tile === 'string') {
                        // Draw follower's avatar
                        await drawTile(ctx, col * GAME_TILE, row * GAME_TILE, tile);
                    } else if (tile === '$') {
                        // Draw empty space ('$' placeholder)
                        ctx.fillStyle = 'black';
                        ctx.fillRect(col * GAME_TILE, row * GAME_TILE, GAME_TILE, GAME_TILE);
                    } else {
                        // Draw regular tile
                        ctx.drawImage(
                            TILE_MAP,
                            ((tile - 1) * GAME_TILE) % TILE_MAP.width,
                            Math.floor((tile - 1) / (TILE_MAP.width / GAME_TILE)) * GAME_TILE,
                            GAME_TILE,
                            GAME_TILE,
                            col * GAME_TILE,
                            row * GAME_TILE,
                            GAME_TILE,
                            GAME_TILE
                        );
                    }

                    // Draw debug grid
                    if (debug) {
                        ctx.strokeStyle = 'white';
                        ctx.strokeRect(col * GAME_TILE, row * GAME_TILE, GAME_TILE, GAME_TILE);
                    }
                }
            }
        };

        drawLevel(LEVEL, debug);
    }, LEVEL, debug);
}

app.get('/canvas', async (req, res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(`
        <canvas id="canvas" width="${GAME_WIDTH}" height="${GAME_HEIGHT}"></canvas>
        <img id="tilemap" src="/Assets/FullSheet.png" style="display: none;">
    `);

    // Load tile map
    await page.waitForFunction(() => document.getElementById('tilemap').complete);

    // Update LEVEL with followers' avatars
    await updateLevelWithFollowers("m7d2");

    // Draw level
    await drawLevel(page);

    // Capture the canvas as an image
    const canvasData = await page.evaluate(() => {
        const canvas = document.getElementById('canvas');
        return canvas.toDataURL().split(',')[1];
    });

    await browser.close();

    // Send the canvas data as an image
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(Buffer.from(canvasData, 'base64'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});