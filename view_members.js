// RMS.Views.members
(function () {
    function render(store) {
        const user = store.getCurrentUser();
        if (user.role !== 'admin') {
            window.location.hash = '/dashboard';
            return document.createElement('div');
        }

        const container = document.createElement('div');
        container.className = 'view-content container';

        const users = store.getUsers().filter(u => u.role !== 'admin');

        container.innerHTML = `
            <header class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Manage Members</h2>
                <a href="#/dashboard" class="btn btn-sm btn-outline"><i class="ph ph-arrow-left"></i> Back</a>
            </header>
    
            <div class="card mb-6">
                <h3 class="text-lg font-bold mb-3">Add New Member</h3>
                <form id="addMemberForm">
                    <div class="grid grid-cols-2 gap-4">
                        <div class="input-group">
                            <label class="label">Full Name</label>
                            <input type="text" name="name" class="input" placeholder="e.g. Rahul Patel" required>
                        </div>
                         <div class="input-group">
                            <label class="label">Mobile</label>
                            <input type="tel" name="mobile" class="input" placeholder="e.g. 9898989898" required>
                        </div>
                    </div>
                    <div class="input-group">
                        <label class="label">Username</label>
                        <input type="text" name="username" class="input" required>
                    </div>
                    <div class="input-group">
                        <label class="label">Password</label>
                        <input type="password" name="password" class="input" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-full">Create Member</button>
                </form>
            </div>
    
            <div class="card">
                <h3 class="text-lg font-bold mb-3">Member List (${users.length})</h3>
                <div class="flex flex-col gap-2">
                    ${users.length === 0 ? '<p class="text-muted">No members yet.</p>' : ''}
                    ${users.map(u => `
                        <div class="border-b py-3 flex justify-between items-center">
                            <div>
                                <div class="font-bold text-lg">${u.name}</div>
                                <div class="text-sm text-muted">
                                    <i class="ph ph-user"></i> ${u.username} • 
                                    <i class="ph ph-phone"></i> ${u.mobile}
                                </div>
                            </div>
                            <button class="btn btn-sm btn-outline btn-edit" data-id="${u.id}">
                                Edit <i class="ph ph-pencil-simple"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add Member Logic
        const form = container.querySelector('#addMemberForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUser = {
                name: form.name.value,
                mobile: form.mobile.value,
                username: form.username.value,
                password: form.password.value
            };
            store.addUser(newUser);
            alert('Member added successfully!');
            // Reload to show new member
            const newView = render(store);
            container.replaceWith(newView);
        });

        // Edit Button Logic
        container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                store.selectedMemberId = id;
                window.location.hash = '/member-detail';
            });
        });

        return container;
    }

    if (!window.RMS.Views) window.RMS.Views = {};
    window.RMS.Views.members = { render };
})();
