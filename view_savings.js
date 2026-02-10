// RMS.Views.savings
(function () {
    function render(store) {
        const user = store.getCurrentUser();
        const container = document.createElement('div');
        container.className = 'container view-content';

        const savings = store.getMemberSavings(user.id);
        const totalSavings = savings.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

        let content = `
            <h2 class="mb-4">My Savings (Bachat)</h2>
            <div class="card bg-primary text-white p-4 mb-4" style="background: linear-gradient(135deg, var(--primary), var(--primary-dark));">
                <div class="text-sm opacity-75">Total Accumulated Savings</div>
                <div class="text-2xl font-bold">₹${totalSavings.toLocaleString()}</div>
            </div>
    
            <div class="list-group">
                <h3 class="mb-2 text-muted">History</h3>
                <!-- List Items -->
                ${savings.length === 0 ? '<p class="text-muted text-center">No savings found.</p>' : ''}
                <div class="flex flex-col gap-2">
                    ${savings.map(s => `
                        <div class="card flex justify-between items-center p-3">
                            <div>
                                <div class="font-bold">₹${parseFloat(s.amount).toLocaleString()}</div>
                                <div class="text-xs text-muted">${new Date(s.date).toLocaleDateString()}</div>
                            </div>
                            <span class="badge badge-success">Credit</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Admin Add Savings Form
        if (user.role === 'admin') {
            content += `
                <div class="mt-8 pt-4 border-t">
                    <h3 class="mb-2">Add Savings (Admin Test)</h3>
                    <form id="addSavingsForm">
                        <div class="input-group">
                            <label class="label">Amount</label>
                            <input type="number" name="amount" class="input" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-full">Add Savings</button>
                    </form>
                </div>
            `;
        }

        // Bottom Nav (Reusable)
        const nav = document.createElement('nav');
        nav.className = 'bottom-nav';
        nav.innerHTML = `
            <a href="#/dashboard" class="nav-item">
                <i class="ph ph-squares-four nav-icon"></i>
                <span>Home</span>
            </a>
            <a href="#/savings" class="nav-item active">
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

        container.innerHTML = content;
        container.appendChild(nav);

        if (user.role === 'admin') {
            const form = container.querySelector('#addSavingsForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const amount = form.amount.value;
                    store.addSaving({
                        memberId: user.id,
                        amount: parseFloat(amount),
                        date: new Date().toISOString()
                    });
                    alert('Savings added!');
                    window.location.reload();
                });
            }
        }

        return container;
    }

    if (!window.RMS.Views) window.RMS.Views = {};
    window.RMS.Views.savings = { render };
})();
