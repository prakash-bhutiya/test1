// RMS.Views.login
(function () {
    function render(store) {
        const container = document.createElement('div');
        container.className = 'view-content container';
        container.style.paddingTop = '4rem';

        container.innerHTML = `
            <div class="text-center mb-4">
                <h1 class="text-primary" style="margin-bottom: 0.5rem;">RMS Society</h1>
                <p class="text-muted">Junagadh Employee Co-operative</p>
            </div>
            
            <div class="card">
                <h2 class="mb-4 text-center">Login</h2>
                <form id="loginForm">
                    <div class="input-group">
                        <label class="label">Username</label>
                        <input type="text" id="username" class="input" placeholder="admin" required>
                    </div>
                    <div class="input-group">
                        <label class="label">Password</label>
                        <input type="password" id="password" class="input" placeholder="admin" required>
                    </div>
                    <button type="submit" class="btn btn-primary w-full">Sign In</button>
                    <div class="mt-4 text-center text-xs text-muted">
                        Test login: admin / admin
                    </div>
                </form>
                <p id="errorMsg" class="text-center mt-4" style="color: var(--danger); display: none;">Invalid credentials</p>
            </div>
        `;

        const form = container.querySelector('#loginForm');
        const errorMsg = container.querySelector('#errorMsg');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = form.username.value;
            const password = form.password.value;

            const user = store.login(username, password);
            if (user) {
                window.location.hash = '/dashboard';
            } else {
                errorMsg.style.display = 'block';
            }
        });

        return container;
    }

    if (!window.RMS.Views) window.RMS.Views = {};
    window.RMS.Views.login = { render };
})();
