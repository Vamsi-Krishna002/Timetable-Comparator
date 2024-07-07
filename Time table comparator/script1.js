document.addEventListener('DOMContentLoaded', () => {
    const slots1 = document.querySelectorAll('#timetable1 .slot');
    const slots2 = document.querySelectorAll('#timetable2 .slot');
    const result = document.getElementById('result');
    const findFreeTimeButton = document.getElementById('findFreeTime');
    const freeTimeTable = document.getElementById('freeTimeTable');

    // Function to clone table structure
    function cloneTableStructure() {
        const table = document.querySelector('#timetable1').cloneNode(true);
        table.id = '';
        table.querySelectorAll('.highlight').forEach(cell => cell.classList.remove('highlight'));
        return table;
    }

    // Initialize freeTimeTable
    const freeTimeTableStructure = cloneTableStructure();
    freeTimeTable.innerHTML = freeTimeTableStructure.innerHTML;

    // Highlight slots on click
    slots1.forEach(slot => {
        slot.addEventListener('click', () => {
            slot.classList.toggle('highlight');
        });
    });

    slots2.forEach(slot => {
        slot.addEventListener('click', () => {
            slot.classList.toggle('highlight');
        });
    });

    // Find common free time
    findFreeTimeButton.addEventListener('click', () => {
        const slots3 = freeTimeTable.querySelectorAll('.slot');

        slots1.forEach((slot, index) => {
            if (!slot.classList.contains('highlight') && !slots2[index].classList.contains('highlight')) {
                slots3[index].classList.add('highlight');
            } else {
                slots3[index].classList.remove('highlight');
            }
        });
    });

    document.getElementById('saveTimetable').addEventListener('click', function() {
        const student1Name = document.getElementById('student1Name').value;
        const student2Name = document.getElementById('student2Name').value;

        const timetable1 = getTimetableData('timetable1');
        const timetable2 = getTimetableData('timetable2');

        const email = localStorage.getItem('email'); // Use email from localStorage

        fetch('http://localhost:3000/saveTimetable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email, // Send the correct email
                student1Name: student1Name,
                student2Name: student2Name,
                student1Timetable: timetable1,
                student2Timetable: timetable2,
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Timetable saved successfully!');
            } else {
                alert('Error saving timetable');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Fetch and display timetable data
    function fetchTimetableData() {
        const email = localStorage.getItem('email'); // Get email from localStorage

        fetch(`http://localhost:3000/getTimetable?email=${email}`)
        .then(response => response.json())
        .then(data => {
            if (data.student1Name && data.student2Name) {
                document.getElementById('student1Name').value = data.student1Name;
                document.getElementById('student2Name').value = data.student2Name;
                setTimetableData('timetable1', data.student1Timetable);
                setTimetableData('timetable2', data.student2Timetable);
            }
        })
        .catch(error => {
            console.error('Error fetching timetable:', error);
        });
    }

    function setTimetableData(timetableId, timetableData) {
        const timetable = document.getElementById(timetableId);
        const slots = timetable.getElementsByClassName('slot');

        timetableData.forEach((highlighted, index) => {
            if (highlighted) {
                slots[index].classList.add('highlight');
            } else {
                slots[index].classList.remove('highlight');
            }
        });
    }

    function getTimetableData(timetableId) {
        const timetable = document.getElementById(timetableId);
        const slots = timetable.getElementsByClassName('slot');
        let timetableData = [];

        for (let slot of slots) {
            timetableData.push(slot.classList.contains('highlight'));
        }

        return timetableData;
    }

    // Call fetchTimetableData when the user logs in
    if (localStorage.getItem('email')) {
        fetchTimetableData();
    }
});
