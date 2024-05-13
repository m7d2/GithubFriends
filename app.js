const express = require('express');
import('node-fetch');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const port = 3000;

// Function to fetch GitHub profile
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

// Function to generate random positions for users
const generateUserPositions = (users, canvasWidth, canvasHeight, imageSize) => {
    for (let i = 0; i < users.length; i++) {
        let overlap = true;
        while (overlap) {
            users[i].x = Math.random() * (canvasWidth - imageSize);
            users[i].y = Math.random() * (canvasHeight - imageSize);
            overlap = checkOverlap(users, i, imageSize);
        }
    }
};

// Function to check overlap with other users
const checkOverlap = (users, currentIndex, imageSize) => {
    for (let i = 0; i < users.length; i++) {
        if (i !== currentIndex) {
            const distance = Math.sqrt(Math.pow(users[i].x - users[currentIndex].x, 2) + Math.pow(users[i].y - users[currentIndex].y, 2));
            if (distance < imageSize) {
                return true;
            }
        }
    }
    return false;
};

// Function to update user positions and return updated SVG content
const updateSVGContent = async (users, canvasWidth, canvasHeight, imageSize) => {
    // Create canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Draw users on canvas
    for (let i = 0; i < users.length; i++) {
        // Load user image
        const image = await loadImage(users[i].avatar_url);
        ctx.drawImage(image, users[i].x, users[i].y, imageSize, imageSize);

        // Draw username text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(users[i].login, users[i].x + imageSize / 2, users[i].y + imageSize + 15);
    }

    // Convert canvas to SVG markup
    let svgContent = `<svg width="100%" height="300" xmlns="http://www.w3.org/2000/svg">`;

    // Draw users as <g> elements
    for (let i = 0; i < users.length; i++) {
        svgContent += `<g transform="translate(${users[i].x},${users[i].y})">`;
        svgContent += `<image href="${users[i].avatar_url}" width="${imageSize}" height="${imageSize}" />`;
        svgContent += `<text x="${imageSize / 2}" y="${imageSize + 15}" text-anchor="middle" fill="white">${users[i].login}</text>`;
        svgContent += `</g>`;
    }

    svgContent += `</svg>`;
    return svgContent;
};

// Function to search GitHub profile and generate SVG content
const searchProfile = async (username) => {
    try {
        const users = await getGitHubProfile(username);
        const canvasWidth = 400;
        const canvasHeight = 300;
        const imageSize = 50;

        // Generate random positions for users
        generateUserPositions(users, canvasWidth, canvasHeight, imageSize);

        // Update SVG content with new user positions
        const svgContent = await updateSVGContent(users, canvasWidth, canvasHeight, imageSize);

        return svgContent;
    } catch (err) {
        throw new Error("Failed to generate SVG container");
    }
};


// Route to get the SVG content
app.get('/svg', async (req, res) => {
    try {
        const svgContent = await searchProfile('m7d2');
        res.set('Content-Type', 'image/svg+xml');
        res.send(svgContent);
    } catch (err) {
        res.status(500).send(err.message);
    }
});
app.get('/', async (req, res) => {
    try {
        const svgContent = await searchProfile('m7d2');
        res.set('Content-Type', 'image/svg+xml');
        res.send(svgContent);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});