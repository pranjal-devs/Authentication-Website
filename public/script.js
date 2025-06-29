// Utility function to show messages
function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
    }
}

// Handle signup form
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            username: document.getElementById('username').value,
            fullname: document.getElementById('fullname').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.message === "You are Signed Up successully") {
                showMessage('Account created successfully! You can now login.', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(data.message || 'An error occurred');
            }
        } catch (error) {
            showMessage('Network error occurred');
        }
    });
}

// Handle login form
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Login failed');
            }
        } catch (error) {
            showMessage('Network error occurred');
        }
    });
}

// Handle dashboard
if (document.getElementById('userInfo')) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
    } else {
        // Load dashboard data
        fetch('/dashboard', {
            headers: {
                'token': token
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                document.getElementById('userInfo').innerHTML = `
                    <h3>${data.message}</h3>
                    <p><strong>User ID:</strong> ${data.userId}</p>
                `;
            } else {
                showMessage('Failed to load dashboard');
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        })
        .catch(error => {
            showMessage('Failed to load dashboard');
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }
}

// Handle logout
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        showMessage('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });
}