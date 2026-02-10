// RMS.Router
(function () {
    class Router {
        constructor(store, appContainerId, routes) {
            this.store = store;
            this.routes = routes;
            this.appContainer = document.getElementById(appContainerId);

            // Listen for hash changes
            window.addEventListener('hashchange', () => this.handleRoute());

            // Initial load
            window.addEventListener('load', () => this.handleRoute());
        }

        async handleRoute() {
            let hash = window.location.hash.slice(1) || '/';

            // Default to login if not authenticated
            const user = JSON.parse(localStorage.getItem('rms_session'));
            if (!user && hash !== '/login') {
                window.location.hash = '/login';
                return;
            }

            if (user && hash === '/login') {
                // Redirect if already logged in
                window.location.hash = '/dashboard';
                return;
            }

            const route = this.routes[hash] || this.routes['/404'];

            if (route) {
                this.appContainer.innerHTML = ''; // Clear previous view
                // Since we are synchronous now, no async import
                const view = route.render(this.store);
                this.appContainer.appendChild(view);
            }
        }

        navigate(path) {
            window.location.hash = path;
        }
    }

    window.RMS.Router = Router;
})();
