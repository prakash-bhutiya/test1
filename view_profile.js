// RMS.Views.profile
(function () {
    function render(store) {
        const user = store.getCurrentUser();
        const container = document.createElement('div');
        container.className = 'container view-content';

        container.innerHTML = `
            <h2 class="mb-4">Profile</h2>
            <div class="card p-4 text-center mb-4">
                <div class="mb-2">
                    <i class="ph ph-user-circle text-6xl text-muted" style="font-size: 4rem;"></i>
                </div>
                <h3 class="text-xl font-bold">${user.name}</h3>
                <p class="text-muted">${user.role === 'admin' ? 'Administrator' : 'Member'}</p>
            </div>
    
            <div class="card p-4">
                <h4 class="mb-2 border-b pb-2">Details</h4>
                <div class="mb-2">
                    <label class="label">Username</label>
                    <div class="font-medium">${user.username}</div>
                </div>
                <div class="mb-2">
                    <label class="label">User ID</label>
                    <div class="text-sm font-mono text-muted py-1 bg-gray-50 rounded">${user.id}</div>
                </div>
                <div class="mb-2">
                    <label class="label">Mobile</label>
                    <div class="font-medium">${user.mobile || 'N/A'}</div>
                </div>
            </div>
    
            <button id="logoutBtn" class="btn btn-outline w-full text-danger border-danger mt-4" style="color: var(--danger); border-color: var(--danger);">Logout</button>
        `;

        // Bottom Nav (Reusable)
        const nav = document.createElement('nav');
        nav.className = 'bottom-nav';
        nav.innerHTML = `
            <a href="#/dashboard" class="nav-item">
                <i class="ph ph-squares-four nav-icon"></i>
                <span>Home</span>
            </a>
            <a href="#/savings" class="nav-item">
                <i class="ph ph-piggy-bank nav-icon"></i>
                <span>Savings</span>
            </a>
            <a href="#/loans" class="nav-item">
                <i class="ph ph-money nav-icon"></i>
                <span>Loans</span>
            </a>
            <a href="#/profile" class="nav-item active">
                <i class="ph ph-user nav-icon"></i>
                <span>Profile</span>
            </a>
        `;

        container.appendChild(nav);

        container.querySelector('#logoutBtn').addEventListener('click', () => {
            store.logout();
            window.location.hash = '/login';
            window.location.reload();
        });

        return container;
    }

    if (!window.RMS.Views) window.RMS.Views = {};
    window.RMS.Views.profile = { render };
})();
