const timeNodes = document.querySelectorAll('.projects .gallery .project .time-logged');

timeNodes.forEach(async (node) => {
    const rawData = node.dataset.project;
    const projectInfo = JSON.parse(rawData);
    
    const time_in_seconds = await fetchData(projectInfo.projectName);

    if (time_in_seconds !== null && time_in_seconds !== undefined) {
        node.textContent = humanize(time_in_seconds);
    } else {
        node.textContent = "Couldn't Fetch Live Info";
    }
});

function humanize(seconds) {
    const hours = Math.trunc(seconds / 3600);
    const minutes = Math.trunc((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
}

async function fetchData(projectName) {
    try {
        const encodedName = encodeURIComponent(projectName);
        const response = await fetch(`https://hackatime.hackclub.com/api/v1/users/810/project/${encodedName}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // Return total_seconds directly from the JSON object
        return data.total_seconds ?? null;
    } catch (error) {
        console.error('Fetch error:', error);
        return null;
    }
}