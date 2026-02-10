// RMS.Store
(function () {
    class Store {
        constructor() {
            this.init();
            this.selectedMemberId = null; // State for Admin Editing
        }

        init() {
            if (!localStorage.getItem('rms_users')) {
                const admin = {
                    id: '1',
                    username: 'admin',
                    password: 'admin',
                    role: 'admin',
                    name: 'System Admin',
                    mobile: '0000000000'
                };
                // Seed Data from Google Sheet
                const prakash = {
                    id: 'prakash_1',
                    username: 'Prakash',
                    password: 'Prakash@123',
                    role: 'member',
                    name: 'Prakash',
                    mobile: 'N/A'
                };
                localStorage.setItem('rms_users', JSON.stringify([admin, prakash]));
            }
            if (!localStorage.getItem('rms_loans')) {
                const prakashLoan = {
                    id: 'loan_prakash_1',
                    memberId: 'prakash_1',
                    principalAmount: 1000,
                    interestRate: 10.5,
                    startDate: new Date().toISOString(),
                    status: 'active',
                    transactions: []
                };
                localStorage.setItem('rms_loans', JSON.stringify([prakashLoan]));
            }
            if (!localStorage.getItem('rms_savings')) localStorage.setItem('rms_savings', JSON.stringify([]));
            if (!localStorage.getItem('rms_session')) localStorage.setItem('rms_session', JSON.stringify(null));
        }

        // Auth
        login(username, password) {
            const users = JSON.parse(localStorage.getItem('rms_users'));
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                localStorage.setItem('rms_session', JSON.stringify(user));
                return user;
            }
            return null;
        }

        logout() {
            localStorage.setItem('rms_session', JSON.stringify(null));
        }

        getCurrentUser() {
            return JSON.parse(localStorage.getItem('rms_session'));
        }

        // Members
        getUsers() {
            return JSON.parse(localStorage.getItem('rms_users'));
        }

        getUser(id) {
            return this.getUsers().find(u => u.id === id);
        }

        addUser(user) {
            const users = this.getUsers();
            user.id = Date.now().toString();
            user.role = 'member';
            users.push(user);
            localStorage.setItem('rms_users', JSON.stringify(users));
        }

        updateUser(updatedUser) {
            const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
            localStorage.setItem('rms_users', JSON.stringify(users));
        }

        // Loans
        getLoans() {
            return JSON.parse(localStorage.getItem('rms_loans'));
        }

        getMemberLoan(memberId) {
            return this.getLoans().find(l => l.memberId === memberId && l.status === 'active');
        }

        addLoan(loan) {
            const loans = this.getLoans();
            loan.id = Date.now().toString();
            loan.status = 'active';
            loan.transactions = [];
            loans.push(loan);
            localStorage.setItem('rms_loans', JSON.stringify(loans));
        }

        updateLoan(updatedLoan) {
            const loans = this.getLoans().map(l => l.id === updatedLoan.id ? updatedLoan : l);
            localStorage.setItem('rms_loans', JSON.stringify(loans));
        }

        addLoanTransaction(loanId, transaction) {
            const loans = this.getLoans();
            const loan = loans.find(l => l.id === loanId);
            if (loan) {
                transaction.id = Date.now().toString();
                loan.transactions.push(transaction);
                localStorage.setItem('rms_loans', JSON.stringify(loans));
            }
        }

        // Savings
        getSavings() {
            return JSON.parse(localStorage.getItem('rms_savings'));
        }

        getMemberSavings(memberId) {
            return this.getSavings().filter(s => s.memberId === memberId);
        }

        addSaving(saving) {
            const savings = this.getSavings();
            saving.id = Date.now().toString();
            if (!saving.date) saving.date = new Date().toISOString();
            savings.push(saving);
            localStorage.setItem('rms_savings', JSON.stringify(savings));
        }

        async syncFromGoogleSheet() {
            const sheetId = '1OCyhiJRx8QE4j2rHd4adY7UtesA7ltI9bIQiQXP0h68';
            // Using gviz/tq endpoint which is often better for CORS and has more consistent output
            const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;

            console.log('Syncing from Google Sheet:', url);

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const csvText = await response.text();
                console.log('Received CSV Data (first 100 chars):', csvText.substring(0, 100));

                const lines = csvText.trim().split('\n');
                if (lines.length <= 1) {
                    console.warn('CSV seems empty (header only or less)');
                    return false;
                }

                const users = this.getUsers();
                const loans = this.getLoans();
                let updateCount = 0;

                // Process each line after header
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    if (!line.trim()) continue;

                    // Improved CSV parsing for possible quoted values
                    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(part => {
                        let clean = part.trim();
                        if (clean.startsWith('"') && clean.endsWith('"')) {
                            clean = clean.substring(1, clean.length - 1);
                        }
                        return clean;
                    });

                    const username = parts[0];
                    const password = parts[1];
                    // Handle loan amount more safely
                    const loanAmountRaw = parts[2] || "0";
                    const loanAmount = parseFloat(loanAmountRaw.replace(/[^0-9.-]+/g, "")) || 0;

                    if (!username || username.toLowerCase() === 'username') continue;

                    console.log(`Processing user: ${username}, Loan: ${loanAmount}`);

                    // Update or Create User
                    let user = users.find(u => u.username === username);
                    if (user) {
                        user.password = password || user.password;
                    } else {
                        user = {
                            id: 'u_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                            username: username,
                            password: password || '123',
                            role: 'member',
                            name: username,
                            mobile: 'N/A'
                        };
                        users.push(user);
                    }

                    // Update or Create Loan
                    let loan = loans.find(l => l.memberId === user.id && l.status === 'active');
                    if (loan) {
                        loan.principalAmount = loanAmount;
                    } else if (loanAmount > 0) {
                        loan = {
                            id: 'l_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                            memberId: user.id,
                            principalAmount: loanAmount,
                            interestRate: 10.5,
                            startDate: new Date().toISOString(),
                            status: 'active',
                            transactions: []
                        };
                        loans.push(loan);
                    }
                    updateCount++;
                }

                localStorage.setItem('rms_users', JSON.stringify(users));
                localStorage.setItem('rms_loans', JSON.stringify(loans));
                console.log(`Sync completed. Updated ${updateCount} records.`);
                return true;
            } catch (error) {
                console.error('Google Sheet Sync Error:', error.message);
                // Alert if it's a CORS issue which is common on file://
                if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                    console.error('This might be a CORS issue. If you are running the app locally from a file (file://), browser security may block the request.');
                }
                return false;
            }
        }

        async exportToGoogleSheet(userData) {
            const scriptUrl = 'https://script.google.com/macros/s/AKfycbwOyQX8I7u6sUvGAVVM_jiezrwj_IykuRH46M3AWCwvTC3GjFaUiDe8qobY1ewYbRjkmw/exec';

            console.log('Exporting to Google Sheet:', userData);

            try {
                // We use no-cors if the script is not set up for CORS, 
                // but usually doPost with Apps Script works better with default fetch if deployed correctly.
                const response = await fetch(scriptUrl, {
                    method: 'POST',
                    mode: 'no-cors', // Essential for bypassing CORS on file:// protocol
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'text/plain', // Becomes a "simple request", no OPTIONS preflight
                    },
                    body: JSON.stringify({
                        username: userData.username,
                        password: userData.password,
                        loan: userData.loan || 0,
                        timestamp: new Date().toISOString()
                    })
                });
                // Note: With no-cors, we cannot read response.ok or response.text()
                // The browser will return an opaque response.
                console.log('Export request dispatched successfully (Opaque response).');
                return true;
            } catch (error) {
                console.error('Export Fetch Error:', error.message);
                return false;
            }
        }
    }

    window.RMS.Store = Store;
})();
