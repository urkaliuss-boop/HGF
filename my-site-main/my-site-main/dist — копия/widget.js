(function () {
    // Noxiss Widget Script
    const containerId = 'noxiss-widget';
    const container = document.getElementById(containerId);

    if (!container) {
        console.error('Noxiss Widget: Container #noxiss-widget not found.');
        return;
    }

    // Get configuration from script tag
    const scriptTag = document.currentScript;
    const userId = scriptTag.getAttribute('data-user') || '';
    const theme = scriptTag.getAttribute('data-theme') || 'light';

    // Create iframe
    const iframe = document.createElement('iframe');

    // Build URL (in production this would be your actual domain)
    // We pass the userId and theme to the widget route
    const baseUrl = new URL(scriptTag.src).origin;
    iframe.src = `${baseUrl}/widget-content?user=${userId}&theme=${theme}`;

    // Set styles for iframe
    iframe.style.border = 'none';
    iframe.style.width = '260px';
    iframe.style.height = '140px';
    iframe.style.overflow = 'hidden';
    iframe.style.background = 'transparent';
    iframe.title = 'Рейтинг от Noxiss';

    // Append to container
    container.innerHTML = ''; // Clear container
    container.appendChild(iframe);
})();
