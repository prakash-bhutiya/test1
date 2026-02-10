// App Entry
(function () {
    console.log('App initializing...');

    // Check if dependencies are loaded
    if (!window.RMS.Store || !window.RMS.Router || !window.RMS.Views) {
        console.error('Core dependencies missing. Check script loading order.');
        document.getElementById('app').innerHTML = '<div style="padding:20px; color:red;">App Error: Scripts not loaded.</div>';
        return;
    }

    const { Store, Router, Views } = window.RMS;

    // Init Store
    const store = new Store();

    // Define Routes
    const routes = {
        '/': Views.dashboard,
        '/login': Views.login,
        '/dashboard': Views.dashboard,
        '/savings': Views.savings,
        '/loans': Views.loans,
        '/profile': Views.profile,
        '/members': Views.members,
        '/member-detail': Views.memberDetail, // New Route
        '/import-data': Views.dataImport, // Import Route
        '/404': { render: () => { const d = document.createElement('div'); d.innerText = 'Page Not Found'; return d; } }
    };

    // Init Router
    const router = new Router(store, 'app', routes);

    // Check Session
    const user = store.getCurrentUser();
    console.log('Current User:', user);

    if (!user) {
        router.navigate('/login');
    } else {
        if (window.location.hash === '' || window.location.hash === '#/') {
            router.navigate('/dashboard');
        } else {
            router.handleRoute();
        }

        // Auto Sync from Google Sheet (Skip if running on local file:// due to CORS)
        if (window.location.protocol !== 'file:') {
            store.syncFromGoogleSheet().then(success => {
                if (success) {
                    console.log('Auto-sync completed');
                    // Only re-render if we are on a data-heavy page
                    const h = window.location.hash;
                    if (h.includes('dashboard') || h.includes('members') || h.includes('loans')) {
                        router.handleRoute();
                    }
                }
            });
        } else {
            console.log('Skipping auto-sync: App is running on local file:// protocol.');
        }
    }

    window.addEventListener('hashchange', () => router.handleRoute());
})();
