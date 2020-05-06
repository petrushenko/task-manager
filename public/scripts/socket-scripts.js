const socket = io.connect();


function createTask(event) {
    const text = document.getElementById("taskText").value;
    const date = document.getElementById("taskDate").value;

    if (text != "" || date != "") {
        const task = {text: text, date: date}
        document.forms.newTask.reset();
        socket.emit('createTask', task);
    }
    else {
        alert("Заполните все поля пожалуйста!");
    }
}

socket.on("fillTable", (tasks) => {
    console.log(tasks);
    fillTasksTable(tasks);
});

function deleteTask(event) {
    const target = event.target.closest('tr');
    const id = target.dataset.task;
    console.log(id);
    socket.emit('deleteTask', id);
}

function updateTask(event) {
    const target = event.target.closest('tr');
    const id = target.dataset.task;
    console.log(id);
    socket.emit('updateTask', id);
}

function fillTasksTable(tasks) {
    let table = document.getElementById("tasksTable");
    clearTable(table);
    for (const task of tasks) {
        let row = table.insertRow();
        row.dataset.task = task.id;
        row.addEventListener('dblclick', deleteTask);
        row.addEventListener('click', updateTask);
        
        let idCell = row.insertCell();
        idCell.append(task.id);

        let text = row.insertCell();
        text.append(task.text);

        let days = Math.round((new Date(task.date) - Date.now()) / (1000 * 3600 * 24)) + 1;

        let daysLeftText = "";
        if (task.completed) {
            row.classList.add("completed-task");
            daysLeftText = "Завершено!";
        } else {
            if (days == 0) {
                row.classList.add("attention-task");
                daysLeftText = "Сделать сегодня!";
            } else if (days == 1) {
                row.classList.add("tommorow-task");
                daysLeftText = "Сделать завтра!";
            } else if (days < 0){
                row.classList.add("expired-task");
                daysLeftText = "Дедлайн прошел!";
            }
            else {
                row.classList.add("non-completed-task");
                daysLeftText = days + " дня(ей)";
            }
        }

        let daysLeft = row.insertCell();
        daysLeft.append(daysLeftText);
    }
}

function clearTable(table) {
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}

