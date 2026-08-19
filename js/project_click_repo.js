const projectNodes = document.querySelectorAll('.projects .gallery .project');

projectNodes.forEach((node) => {
    node.addEventListener('click', () => {
        try {
            const rawData = node.dataset.project;
            const projectInfo = JSON.parse(rawData);
            
            // Make sure the repo URL actually exists before opening
            if (projectInfo && projectInfo.repo) {
                window.open(projectInfo.repo, '_blank');
            }
        } catch (error) {
            console.error('Could not parse project data:', error);
        }
    });
});