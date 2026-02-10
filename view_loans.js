// RMS.Views.loans
(function () {
    function render(store) {
        const user = store.getCurrentUser();
        const container = document.createElement('div');
        container.className = 'container view-content';

        const loans = store.getMemberLoan(user.id) ? [store.getMemberLoan(user.id)] : [];

        let content = `
            <h2 class="mb-4">My Loans</h2>
            ${loans.length === 0 ? '<p class="text-muted">No active loans.</p>' : ''}
            ${loans.map(loan => `
                <div class="card p-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="badge badge-warning">Active</span>
                        <span class="text-xs text-muted">ID: ${loan.id}</span>
                    </div>
                    <div class="text-2xl font-bold mb-1">₹${parseFloat(loan.principalAmount).toLocaleString()}</div>
                    <div class="text-sm text-muted mb-4">Initial Amount</div>
                    
                    <div class="flex justify-between text-sm mb-2">
                        <span>Interest Rate</span><span>${loan.interestRate}%</span>
                    </div>
                    <div class="flex justify-between text-sm mb-2">
                        <span>Start Date</span><span>${new Date(loan.startDate).toLocaleDateString()}</span>
                    </div>
    
                    <div class="mt-4 pt-4 border-t">
                        <h4 class="mb-2">Transactions</h4>
                        ${loan.transactions.length === 0 ? '<p class="text-xs text-muted">No transactions yet.</p>' : ''}
                        <ul class="text-sm">
                            ${loan.transactions.map(t => `
                                <li class="flex justify-between py-1 border-b border-gray-100">
                                    <span>${t.type}</span>
                                    <span class="${t.type === 'EMI' ? 'text-danger' : 'text-success'}">₹${t.amount}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `).join('')}
        `;

        // Admin Add Loan Form (For Testing Self)
        if (user.role === 'admin') {
            content += `
                <div class="mt-8 pt-4 border-t">
                    <h3 class="mb-2">Request Loan (Admin Test)</h3>
                    <form id="addLoanForm">
                        <div class="input-group">
                            <label class="label">Amount</label>
                            <input type="number" name="amount" class="input" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-full">Request Loan</button>
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
            <a href="#/savings" class="nav-item">
                <i class="ph ph-piggy-bank nav-icon"></i>
                <span>Savings</span>
            </a>
            <a href="#/loans" class="nav-item active">
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
            const form = container.querySelector('#addLoanForm');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const amount = form.amount.value;
                    store.addLoan({
                        memberId: user.id,
                        principalAmount: parseFloat(amount),
                        interestRate: 10.5,
                        startDate: new Date().toISOString()
                    });
                    alert('Loan request added!');
                    window.location.reload();
                });
            }
        }

        return container;
    }

    if (!window.RMS.Views) window.RMS.Views = {};
    window.RMS.Views.loans = { render };
})();
