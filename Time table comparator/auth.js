const apiBaseUrl = 'http://localhost:3000';

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        alert('Login successful');
        localStorage.setItem('email', email); // Store email for future use
        window.location.href = 'timetable.html'; // Redirect to timetable page
    } else {
        alert('Login failed');
    }
}

async function signup() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    const response = await fetch(`${apiBaseUrl}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    if (response.ok) {
        alert('Signup successful');
        window.location.href = 'timetable.html'; // Redirect to timetable page
    } else {
        alert('Signup failed');
    }
}

async function saveTimetable() {
    const email = localStorage.getItem('email');
    const student1Name = document.getElementById('student1').value;
    const student1Timetable = document.getElementById('student1Timetable').value;
    const student2Name = document.getElementById('student2').value;
    const student2Timetable = document.getElementById('student2Timetable').value;

    const response = await fetch(`${apiBaseUrl}/saveTimetable`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, student1Name, student1Timetable, student2Name, student2Timetable })
    });

    if (response.ok) {
        alert('Timetable saved successfully');
    } else {
        alert('Failed to save timetable');
    }
}

async function getTimetable() {
    const email = localStorage.getItem('email');

    const response = await fetch(`${apiBaseUrl}/getTimetable?email=${email}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const timetable = await response.json();
        document.getElementById('timetable-display').innerText = `
            Student 1: ${timetable.student1Name}
            Student 1 Timetable: ${timetable.student1Timetable}
            Student 2: ${timetable.student2Name}
            Student 2 Timetable: ${timetable.student2Timetable}
        `;
    } else {
        alert('Failed to retrieve timetable');
    }
}
