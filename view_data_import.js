// RMS.Views.dataImport
(function () {
    function render(store) {
        const user = store.getCurrentUser();
        if (user.role !== 'admin') {
            window.location.hash = '/dashboard';
            return document.createElement('div');
        }

        const container = document.createElement('div');
        container.className = 'container view-content';

        container.innerHTML = `
            <header class="flex justify-between items-center mb-6">
                <button class="btn btn-sm btn-outline w-auto" onclick="window.history.back()">
                    <i class="ph ph-arrow-left"></i> Back
                </button>
                <div class="text-lg font-bold">Import Data</div>
                <div style="width: 70px;"></div>
            </header>

            <div class="card">
                <h3 class="text-primary mb-2">Instructions</h3>
                <ol class="text-sm text-muted mb-4" style="padding-left: 1.5rem;">
                    <li>Open your Spreadsheet (Excel or Google Sheets).</li>
                    <li>Ensure columns are in order: <strong>Username, Password, Loan Amount</strong>.</li>
                    <li>Select the data rows (excluding headers if possible) and <strong>Copy (Ctrl+C)</strong>.</li>
                    <li><strong>Paste (Ctrl+V)</strong> into the box below.</li>
                </ol>
                
                <textarea id="importData" class="input" rows="10" placeholder="Paste data here..."></textarea>
                
                <div class="flex gap-2 mt-4">
                    <button id="btnPreview" class="btn btn-primary">Preview Data</button>
                    <button id="btnClear" class="btn btn-outline">Clear</button>
                </div>
            </div>

            <div id="previewSection" class="card" style="display: none;">
                <h3 class="text-primary mb-2">Preview</h3>
                <div style="overflow-x: auto;">
                    <table class="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr class="border-b">
                                <th class="p-2">Username</th>
                                <th class="p-2">Password</th>
                                <th class="p-2">Loan</th>
                            </tr>
                        </thead>
                        <tbody id="previewBody"></tbody>
                    </table>
                </div>
                <button id="btnImport" class="btn btn-primary mt-4">Import All</button>
            </div>
        `;

        let parsedData = [];

        const parseData = (text) => {
            const lines = text.trim().split('\n');
            return lines.map(line => {
                // Detect delimiter: Tab (TSV) or Comma (CSV)
                const parts = line.includes('\t') ? line.split('\t') : line.split(',');
                // Mapping: Username (0), Password (1), Loan (2)
                return {
                    username: parts[0]?.trim(),
                    password: parts[1]?.trim(),
                    loan: parseFloat(parts[2]?.replace(/[^0-9.-]+/g, "")) || 0,
                    // Defaults
                    name: parts[0]?.trim(),
                    mobile: '',
                    savings: 0,
                    loanDate: new Date().toISOString()
                };
            }).filter(d => d.username && d.username.toLowerCase() !== 'username'); // Filter empty rows and header
        };

        const btnPreview = container.querySelector('#btnPreview');
        const btnClear = container.querySelector('#btnClear');
        const textarea = container.querySelector('#importData');
        const previewSection = container.querySelector('#previewSection');
        const previewBody = container.querySelector('#previewBody');
        const btnImport = container.querySelector('#btnImport');

        btnPreview.addEventListener('click', () => {
            const text = textarea.value;
            if (!text) return alert('Please paste some data first.');

            parsedData = parseData(text);
            if (parsedData.length === 0) return alert('No valid data found.');

            previewBody.innerHTML = parsedData.map(d => `
                <tr class="border-b border-gray-100">
                    <td class="p-2">${d.username}</td>
                    <td class="p-2">${d.password}</td>
                    <td class="p-2">₹${d.loan.toLocaleString()}</td>
                </tr>
            `).join('');

            previewSection.style.display = 'block';
        });

        btnClear.addEventListener('click', () => {
            textarea.value = '';
            previewSection.style.display = 'none';
            parsedData = [];
        });

        btnImport.addEventListener('click', () => {
            if (!confirm(`Import ${parsedData.length} records? This will create new members.`)) return;

            let count = 0;
            parsedData.forEach(d => {
                // 1. Create User
                // Use the Username from sheet as both username and name
                const user = {
                    name: d.username,
                    mobile: d.mobile || 'N/A',
                    username: d.username,
                    password: d.password
                };
                store.addUser(user);

                // Lookup created user (by username)
                const createdUser = store.getUsers().find(u => u.username === user.username);

                if (createdUser) {
                    // 2. Add Savings
                    if (d.savings > 0) {
                        store.addSaving({
                            memberId: createdUser.id,
                            amount: d.savings,
                            date: new Date().toISOString()
                        });
                    }

                    // 3. Add Loan
                    if (d.loan > 0) {
                        store.addLoan({
                            memberId: createdUser.id,
                            principalAmount: d.loan,
                            interestRate: 10.5,
                            startDate: d.loanDate || new Date().toISOString(),
                            status: 'active',
                            transactions: []
                        });
                    }
                    count++;
                }
            });

            alert(`Successfully imported ${count} members!`);
            window.location.hash = '/members';
        });

        return container;
    }

    if (!window.RMS.Views) window.RMS.Views = {};
    window.RMS.Views.dataImport = { render };
})();
