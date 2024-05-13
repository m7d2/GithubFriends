const GAME_WIDTH = 560;
const GAME_HEIGHT = 176;
// const GAME_WIDTH = 560;
// const GAME_HEIGHT = 176;
const GAME_TILE = 16;
const ROWS = GAME_HEIGHT / GAME_TILE;
const COLUMNS = GAME_WIDTH / GAME_TILE;
let debugBtn = document.getElementById('debug');
let debug = false;
const getGitHubProfile = async (user) => {
    let githubUrl = `https://api.github.com/users/${user}/followers`;

    try {
        const response = await fetch(githubUrl);

        if (response.status === 200) {
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

function getTile(map, col, row) {
    return map[row * COLUMNS + col];
}

// variable for controlling the vertical position of the names
let nameOffsetY = 5;

function drawLevel(ctx, canvas, TILE_MAP) {
    const IMAGE_TILE = 16;
    const IMAGE_COLS = TILE_MAP.width / IMAGE_TILE;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLUMNS; col++) {
            const tile = getTile(LEVEL, col, row);
            if (typeof tile === 'string') { // If it's an avatar URL (GitHub follower)
                // Load and draw the avatar
                const avatarImg = new Image();
                avatarImg.src = tile;
                avatarImg.onload = function () {
                    // Calculate the position of the image
                    const imageX = col * GAME_TILE;
                    const imageY = row * GAME_TILE;
                    ctx.drawImage(avatarImg, imageX, imageY, GAME_TILE * 2, GAME_TILE * 2);
                    // Retrieve the follower's name and draw it centered above the image
                    const followerIndex = col + row * COLUMNS;
                    const follower = LEVEL[followerIndex + COLUMNS]; // Adjusted row position
                    if (follower && follower.name) {
                        ctx.fillStyle = 'white'; // Set the fill style to white
                        ctx.font = '12px Arial'; // Set the font style
                        ctx.textAlign = 'center';
                        const textX = imageX + GAME_TILE; // Center the name horizontally above the image
                        const textY = imageY - nameOffsetY; // Adjusted y-position above the image
                        ctx.fillText(follower.name, textX, textY);
                    }
                };
                // Skip next tile since it's occupied by this follower's avatar
                col++;
            } else { // If it's a regular tile
                ctx.drawImage(
                    TILE_MAP,
                    ((tile - 1) * IMAGE_TILE) % TILE_MAP.width, // column
                    Math.floor((tile - 1) / IMAGE_COLS) * IMAGE_TILE, // row
                    IMAGE_TILE,
                    IMAGE_TILE,
                    col * GAME_TILE,
                    row * GAME_TILE,
                    GAME_TILE,
                    GAME_TILE
                );
            }
            if (debug) {
                ctx.strokeRect(col * GAME_TILE, row * GAME_TILE, GAME_TILE, GAME_TILE);
            }
        }
    }
}

async function placeFollowersFromGitHub(user, canvas, ctx) {
    try {
        const followers = await getGitHubProfile(user);
        let followerIndex = 0;
        let imageSize = 3;
        const nameOffsetY = 5; // Adjust this value to control the vertical position of the name

        // Fill the canvas with black color as background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < LEVEL.length; i++) {
            if (LEVEL[i] === 0 || LEVEL[i] === '$') {
                if (i % COLUMNS <= COLUMNS - 2 && i + COLUMNS <= LEVEL.length) {
                    // Check if the 2x2 space is empty
                    let foundEmptySpace = true;
                    for (let j = 0; j < 2; j++) {
                        for (let k = 0; k < 2; k++) {
                            if (LEVEL[i + j * COLUMNS + k] !== 0 && LEVEL[i + j * COLUMNS + k] !== '$') {
                                foundEmptySpace = false;
                                break;
                            }
                        }
                        if (!foundEmptySpace) break;
                    }
                    if (foundEmptySpace && followerIndex < followers.length) {
                        // Fill the 2x2 space with follower's avatar
                        const avatarUrl = followers[followerIndex]?.avatar_url;
                        const followerName = followers[followerIndex]?.login; // Get the follower's name
                        if (avatarUrl && followerName) {
                            // Load the avatar image
                            const avatarImg = new Image();
                            avatarImg.src = avatarUrl;
                            // Draw the image once to fit the 2x2 space
                            avatarImg.onload = function () {
                                const imgX = i % COLUMNS * GAME_TILE * imageSize;
                                const imgY = Math.floor(i / COLUMNS * imageSize) * GAME_TILE;
                                ctx.drawImage(avatarImg, imgX, imgY, imageSize * GAME_TILE, imageSize * GAME_TILE);

                                // Render the follower's name below the image
                                ctx.fillStyle = "white";
                                const maxWidth = imageSize * GAME_TILE; // Maximum width for the name text
                                let fontSize = 9; // Initial font size
                                ctx.font = `${fontSize}px Arial`;
                                // do {
                                //     fontSize--; // Reduce font size until text fits within maxWidth
                                //     ctx.font = `${fontSize}px Arial`;
                                // } while (ctx.measureText(followerName).width > maxWidth);

                                // Calculate text position to center it below the image
                                const textWidth = ctx.measureText(followerName).width;
                                const textX = imgX + (maxWidth - textWidth) / 2;
                                const textY = (Math.floor(i / COLUMNS * imageSize) + nameOffsetY ) * GAME_TILE; // Adjust the position using nameOffsetY
                                let usedRandomValues = [];

                                function generateUniqueRandom() {
                                    let random;
                                    do {
                                        random = Math.floor(Math.random() * (160 - (textY - 20)) + (textY - 20));
                                    } while (usedRandomValues.some(value => Math.abs(random - value) < 10));
                                    usedRandomValues.push(random);
                                    return random;
                                }

                                const textYRandom = generateUniqueRandom();
                                console.log(textYRandom);
                                // Set image smoothing to false for crisp text
                                ctx.imageSmoothingEnabled = false;
                                ctx.fillText(followerName, textX, textYRandom);
                                ctx.imageSmoothingEnabled = true; // Reset image smoothing to default
                            };
                            followerIndex++;
                            LEVEL[i] = '$'; // Mark the space as filled with the avatar
                        }
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
        console.log(LEVEL); // Output the updated LEVEL array with followers
    } catch (error) {
        console.error(error);
    }
}


window.addEventListener('load', async (evt) => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    // Enable image smoothing
    ctx.imageSmoothingEnabled = true;

    const TILE_MAP = document.getElementById('tilemap');

    // Call placeFollowersFromGitHub to fetch followers and update LEVEL
    await placeFollowersFromGitHub("m7d2", canvas, ctx);

    // Call drawLevel initially to draw the initial state
    drawLevel(ctx, canvas, TILE_MAP);

    debugBtn.addEventListener('click', (evt) => {
        debug = !debug;
        drawLevel(ctx, canvas, TILE_MAP);
    });
});

