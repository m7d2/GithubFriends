const getGitHubProfile = async user => {
    let githubUrl = `https://api.github.com/users/${user}/followers`;
    let data;

    try {
        const response = await fetch(githubUrl);

        if (response.status == 200)
            data = await response.json();

        return data;

    } catch (err) {
        console.log(err);
        throw new Error("Unable to connect to Github Web API");
    }
}

async function searchProfile(username) {
    try {
        let users = await getGitHubProfile(username);

        const svgContainer = document.getElementById('svg-container');
        const svgWidth = svgContainer.clientWidth;
        const svgHeight = svgContainer.clientHeight;

        for (let i = 0; i < users.length; i++) {
            const userGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const avatarImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
            const loginText = document.createElementNS("http://www.w3.org/2000/svg", "text");

            userGroup.setAttribute('class', 'user');
            avatarImage.setAttribute('href', users[i].avatar_url);

            // Calculate maximum allowed size for image and text
            const maxSize = Math.min(svgWidth, svgHeight) / 5; // 1/5 of the SVG dimensions
            avatarImage.setAttribute('width', maxSize);
            avatarImage.setAttribute('height', maxSize);

            // Randomly position users within the SVG container
            let userX, userY;
            let overlap = true;
            while (overlap) {
                userX = Math.random() * (svgWidth - maxSize);
                userY = Math.random() * (svgHeight - maxSize);
                overlap = checkOverlap(users, userX, userY, maxSize);
            }
            userGroup.setAttribute('transform', `translate(${userX},${userY})`);

            // Position the avatar image at the center of the user object
            avatarImage.setAttribute('x', (maxSize / 2) * -1);
            avatarImage.setAttribute('y', (maxSize / 2) * -1);

            // Position the login text centered vertically with the image
            loginText.textContent = users[i].login;
            loginText.setAttribute('text-anchor', 'middle');
            loginText.setAttribute('alignment-baseline', 'middle');
            loginText.setAttribute('x', 0); // Center horizontally relative to the user object
            loginText.setAttribute('y', maxSize / 2 + maxSize / 10); // Vertically centered with a slight offset
            loginText.setAttribute('fill', 'white'); // Set text color to white

            userGroup.appendChild(avatarImage);
            userGroup.appendChild(loginText);
            svgContainer.appendChild(userGroup);

            // Initialize user object with start and end positions
            users[i] = {
                element: userGroup,
                startX: userX,
                startY: userY,
                endX: Math.random() * (svgWidth - maxSize),
                endY: Math.random() * (svgHeight - maxSize)
            };
        }

        // Start floating animation
        animateFloating(svgWidth, svgHeight, users);

    } catch (err) {
        console.log(err);
    }
}

function checkOverlap(users, x, y, size) {
    for (let user of users) {
        const userX = user.startX;
        const userY = user.startY;
        const distance = Math.sqrt(Math.pow(x - userX, 2) + Math.pow(y - userY, 2));
        if (distance < size * 2) { // Set the minimum distance between users
            return true;
        }
    }
    return false;
}

function animateFloating(svgWidth, svgHeight, users) {
    users.forEach(user => {
        // Check if the user hits the boundaries
        const imageSize = parseFloat(user.element.querySelector('image').getAttribute('width'));

        if (user.startX <= 0 || user.startX + imageSize >= svgWidth) {
            // Reverse the direction horizontally
            user.endX = user.startX - (user.endX - user.startX);
        }
        if (user.startY <= 0 || user.startY + imageSize >= svgHeight) {
            // Reverse the direction vertically
            user.endY = user.startY - (user.endY - user.startY);
        }
    });

    function step() {
        users.forEach(user => {
            // Move each user towards their end position
            user.startX += (user.endX - user.startX) * 0.001;
            user.startY += (user.endY - user.startY) * 0.001;

            // Update user object position
            user.element.setAttribute('transform', `translate(${user.startX},${user.startY})`);
        });

        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

searchProfile('m7d2');
