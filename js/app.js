const $ = selector => document.querySelector(selector);


let info = $('.info');

const getGitHubProfile = async user => {
    // `https://api.github.com/users/m7d2`
    let githubUrl = `https://api.github.com/users/${user}/followers`;
    let data; // undefined

    try {
        const response = await fetch(githubUrl);

        console.table(response.status);

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
        let user = await getGitHubProfile(username);

        for (let i =0; i < user.length; i++){
            info.innerHTML += `<div class="user"><img src="${user[i].avatar_url}" width="${1500 / user.length}" height="${1500 / user.length}"/><h3>${user[i].login}</h3></div>`;
        }

    } catch (err) {
        console.log(err);
    }
}


searchProfile('m7d2');

