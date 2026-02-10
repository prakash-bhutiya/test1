// RMS.Views.memberDetail
(function () {
    function render(store) {
        const admin = store.getCurrentUser();
        if (admin.role !== 'admin') {
            window.location.hash = '/dashboard';
            return document.createElement('div');
        }

        const memberId = store.selectedMemberId;
        if (!memberId) {
            window.location.hash = '/members';
            return document.createElement('div');
        }

        const member = store.getUser(memberId);
        const savings = store.getMemberSavings(memberId);
        const totalSavings = savings.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        const activeLoan = store.getMemberLoan(memberId);

        const container = document.createElement('div');
        container.className = 'container view-content';

        container.innerHTML = `
            <header class="flex justify-between items-center mb-6">
                <button class="btn btn-sm btn-outline w-auto" onclick="window.history.back()">
                    <i class="ph ph-arrow-left"></i> Back
                </button>
                <div class="text-lg font-bold">Edit Member</div>
                <div style="width: 70px;"></div> <!-- Spacer -->
            </header>

            <!-- Profile Section -->
            <div class="card">
                <h3 class="text-primary mb-4 flex items-center gap-2">
                    <i class="ph ph-user-circle"></i> Profile
                </h3>
                <form id="editProfileForm">
                    <div class="input-group">
                        <label class="label">Full Name</label>
                        <input type="text" name="name" class="input" value="${member.name}" required>
                    </div>
                    <div class="input-group">
                        <label class="label">Mobile</label>
                        <input type="tel" name="mobile" class="input" value="${member.mobile || ''}">
                    </div>
                    <div class="input-group">
                        <label class="label">Password (Reset)</label>
                        <input type="text" name="password" class="input" value="${member.password}" >
                    </div>
                    <button type="submit" class="btn btn-primary">Update Profile</button>
                </form>
            </div>

            <!-- Savings Section -->
            <div class="card">
                <h3 class="text-primary mb-4 flex items-center gap-2">
                    <i class="ph ph-piggy-bank"></i> Savings (Bachat)
                </h3>
                <div class="bg-primary text-white p-4 rounded-xl mb-4 gradient-primary">
                    <div class="text-white-70 text-sm">Total Balance</div>
                    <div class="text-3xl font-bold">₹${totalSavings.toLocaleString()}</div>
                </div>
                
                <h4 class="text-sm font-bold text-muted mb-2">Actions</h4>
                <div class="grid grid-cols-2 gap-2 mb-4">
                    <button class="btn btn-outline" id="btnCreditSavings">
                        <i class="ph ph-plus"></i> Credit
                    </button>
                    <button class="btn btn-outline text-danger" style="color: var(--danger); border-color: var(--danger);" id="btnDebitSavings">
                        <i class="ph ph-minus"></i> Debit
                    </button>
                </div>
                
                <details>
                    <summary class="cursor-pointer text-sm text-primary font-bold">View History</summary>
                    <div class="mt-2 text-sm border-t pt-2">
                         ${savings.map(s => `
                            <div class="flex justify-between py-1">
                                <span class="text-muted">${new Date(s.date).toLocaleDateString()}</span>
                                <span class="${parseFloat(s.amount) > 0 ? 'text-success' : 'text-danger'} font-bold">
                                    ₹${parseFloat(s.amount).toLocaleString()}
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </details>
            </div>

            <!-- Loan Section -->
            <div class="card">
                <h3 class="text-primary mb-4 flex items-center gap-2">
                    <i class="ph ph-money"></i> Active Loan
                </h3>
                
                ${activeLoan ? `
                    <div class="mb-4">
                        <label class="label">Principal Amount</label>
                        <div class="flex gap-2">
                            <input type="number" id="loanPrincipal" class="input" value="${activeLoan.principalAmount}">
                            <button id="btnUpdateLoan" class="btn btn-primary w-auto">Update</button>
                        </div>
                    </div>
                     <div class="mb-4">
                        <div class="flex justify-between text-sm mb-1">
                            <span>Interest Rate</span><span>${activeLoan.interestRate}%</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span>Start Date</span><span>${new Date(activeLoan.startDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <h4 class="text-sm font-bold text-muted mb-2">Repayment</h4>
                    <button class="btn btn-outline w-full mb-2" id="btnAddRepayment">Add Repayment Entry</button>
                ` : `
                    <p class="text-muted mb-4">No active loan.</p>
                    <button class="btn btn-primary" id="btnIssueLoan">Issue New Loan</button>
                `}
            </div>
        `;

        // Functionality

        // 1. Update Profile
        container.querySelector('#editProfileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            member.name = form.name.value;
            member.mobile = form.mobile.value;
            member.password = form.password.value;
            store.updateUser(member);
            alert('Profile updated!');
        });

        // 2. Savings Actions
        const handleSavings = (multiplier) => {
            const amount = prompt("Enter amount:");
            if (amount && !isNaN(amount)) {
                store.addSaving({
                    memberId: member.id,
                    amount: parseFloat(amount) * multiplier,
                    date: new Date().toISOString()
                });
                alert('Savings updated');
                window.location.reload();
            }
        };

        container.querySelector('#btnCreditSavings').onclick = () => handleSavings(1);
        container.querySelector('#btnDebitSavings').onclick = () => handleSavings(-1);

        // 3. Loan Actions
        if (activeLoan) {
            container.querySelector('#btnUpdateLoan').onclick = () => {
                const newAmount = container.querySelector('#loanPrincipal').value;
                if (newAmount && !isNaN(newAmount)) {
                    activeLoan.principalAmount = parseFloat(newAmount);
                    store.updateLoan(activeLoan);
                    alert('Loan Principal Updated');
                }
            };
            container.querySelector('#btnAddRepayment').onclick = () => {
                const amount = prompt("Enter repayment amount:");
                if (amount && !isNaN(amount)) {
                    store.addLoanTransaction(activeLoan.id, {
                        type: 'EMI',
                        amount: parseFloat(amount),
                        date: new Date().toISOString()
                    });
                    alert('Repayment Added');
                    window.location.reload();
                }
            };
        } else {
            const btnIssue = container.querySelector('#btnIssueLoan');
            if (btnIssue) {
                btnIssue.onclick = () => {
                    const amount = prompt("Enter Loan Amount:");
                    if (amount && !isNaN(amount)) {
                        store.addLoan({
                            memberId: member.id,
                            principalAmount: parseFloat(amount),
                            interestRate: 10.5,
                            startDate: new Date().toISOString()
                        });
                        alert('Loan Issued');
                        window.location.reload();
                    }
                };
            }
        }

        return container;
    }

    if (!window.RMS.Views) window.RMS.Views = {};
    window.RMS.Views.memberDetail = { render };
})();
