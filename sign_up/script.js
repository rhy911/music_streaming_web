document.getElementById('signUpForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username-input').value;
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const rePassword = document.getElementById('re_password-input').value;
    const terms = document.getElementById('terms').checked;

    if (password !== rePassword) {
        alert('Passwords do not match');
        return;
    }

    if (!terms) {
        alert('You must agree to the terms of use');
        return;
    }

    try {
        const response = await fetch('http://localhost:8000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            const newUser = await response.json();
            alert(`User created with ID: ${newUser.user_id}`);
        } else {
            const errorText = await response.text();
            alert(`Failed to create user: ${errorText}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while creating the user.');
    }
});
