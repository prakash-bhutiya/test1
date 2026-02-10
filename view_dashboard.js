// RMS.Views.dashboard
(function () {
    function render(store) {
        const user = store.getCurrentUser();
        if (!user) return document.createElement('div');

        const container = document.createElement('div');
        container.className = 'view-content';

        // Header
        const header = document.createElement('header');
        header.className = 'app-header';
        header.innerHTML = `
            <div class="app-logo">RMS App</div>
            <div class="user-info text-sm text-muted">
                Hello, <span class="font-bold text-primary">${user.name}</span>
            </div>
        `;

        // Content
        const content = document.createElement('main');
        content.className = 'container';

        // Get Data
        let summaryHTML = '';

        if (user.role === 'admin') {
            const users = store.getUsers().length;
            const totalLoans = store.getLoans().reduce((acc, curr) => acc + parseFloat(curr.principalAmount), 0);

            summaryHTML = `
                <div class="card bg-primary text-white" style="background: var(--primary);">
                    <div class="stat-label" style="color: var(--primary-light);">Total Members</div>
                    <div class="stat-value" style="color: white;">${users}</div>
                </div>
                <div class="card">
                    <div class="stat-label">Total Loans Issued</div>
                    <div class="stat-value">₹${totalLoans.toLocaleString()}</div>
                </div>
                 <div class="card">
                    <div class="stat-label">Admin Actions</div>
                    ${window.location.protocol === 'file:' ? `
                        <div class="bg-warning text-xs p-3 rounded-lg mb-2" style="background: rgba(245, 158, 11, 0.1); color: #92400e; border: 1px solid rgba(245, 158, 11, 0.2);">
                            <i class="ph ph-warning-circle"></i> <strong>Note:</strong> Browser security (CORS) blocks auto-sync on local files. Use manual import below.
                        </div>
                    ` : ''}
                    <div class="flex flex-col gap-2 mt-4">
                        <button id="btnSync" class="btn btn-outline w-full" style="color: var(--success); border-color: var(--success);" ${window.location.protocol === 'file:' ? 'disabled' : ''}>
                            <i class="ph ph-arrows-clockwise"></i> Sync From Sheet
                        </button>
                        <a href="#/members" class="btn btn-primary w-full">Manage Members</a>
                        <a href="#/loans" class="btn btn-outline w-full">Manage Loans</a>
                        <a href="#/import-data" class="btn btn-outline w-full text-muted" style="border-style: dashed;">
                            <i class="ph ph-upload-simple"></i> Import Data
                        </a>
                    </div>
                </div>
            `;
        } else {
            const myLoan = store.getMemberLoan(user.id);
            const mySavings = store.getMemberSavings(user.id);
            const totalSavings = mySavings.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
            const loanAmount = myLoan ? parseFloat(myLoan.principalAmount) : 0;

            summaryHTML = `
                <div class="card" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: white;">
                    <div class="stat-label" style="color: var(--primary-light);">Total Savings (Bachat)</div>
                    <div class="stat-value" style="color: white;">₹${totalSavings.toLocaleString()}</div>
                </div>

                <div class="card">
                    <div class="flex justify-between items-center mb-4">
                        <div class="stat-label">Active Loan</div>
                        ${myLoan ? '<span class="badge badge-warning">Active</span>' : '<span class="badge badge-success">No Loan</span>'}
                    </div>
                    <div class="stat-value text-primary">₹${loanAmount.toLocaleString()}</div>
                    ${myLoan ? `
                        <div class="text-xs text-muted mt-2">Interest Rate: ${myLoan.interestRate}%</div>
                        <div class="text-xs text-muted">Start Date: ${new Date(myLoan.startDate).toLocaleDateString()}</div>
                    ` : ''}
                </div>
            `;
        }

        content.innerHTML = `
            <h2 class="mb-4">Dashboard</h2>
            <div class="grid gap-4">
                ${summaryHTML}
            </div>
        `;

        // Bottom Nav
        const nav = document.createElement('nav');
        nav.className = 'bottom-nav';
        nav.innerHTML = `
            <a href="#/dashboard" class="nav-item active">
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
            <a href="#/profile" class="nav-item">
                <i class="ph ph-user nav-icon"></i>
                <span>Profile</span>
            </a>
        `;

        // Sync Logic
        const btnSync = container.querySelector('#btnSync');
        if (btnSync) {
            btnSync.addEventListener('click', async () => {
                btnSync.disabled = true;
                btnSync.innerHTML = '<i class="ph ph-circle-notch ph-spin"></i> Syncing...';
                const success = await store.syncFromGoogleSheet();
                btnSync.disabled = false;
                btnSync.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Sync From Sheet';
                if (success) {
                    alert('Data synced successfully from Google Sheet!');
                    // Re-render dashboard to show new stats
                    window.location.reload();
                } else {
                    alert('Sync failed. Please ensure the Google Sheet is public.');
                }
            });
        }

        container.appendChild(header);
        container.appendChild(content);
        container.appendChild(nav);

        return container;
    }

    if (!window.RMS.Views) window.RMS.Views = {};
    window.RMS.Views.dashboard = { render };
})();
