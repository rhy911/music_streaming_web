document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;
    const remmeber = document.getElementById('remember').checked;

    try {
        const response = await fetch('http://localhost:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('currentuser_id', data.user_id);
            alert('Login successful with user_id: ' + sessionStorage.getItem('currentuser_id'));
            window.location.href = '/home/home.html';
        } else {
            const errorData = await response.json();
            alert(`Login failed: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        alert('An error occurred while logging in');
    }
});