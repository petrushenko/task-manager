function loadTasks() {
    fetch("http://127.0.0.1:4444/graphql/", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        body: JSON.stringify({
            query: `{
                tasks {id, text, endTime, completed}
              }`,
          })
    })
    .then(response => response.json())
    .then(data => {
        fillTasksTable(data.data.tasks);
    })
    .catch(error => {
        alert("Error in getting tasks");
    });
}

loadTasks();

function createTask(event) {
    const text = document.getElementById("taskText").value;
    const date = document.getElementById("taskDate").value;
    console.log(date);
    if (text != "" && date != "") {
        const task = {text: text, endTime: date}
        document.forms.newTask.reset();
        console.log(task);
        var query = `mutation createTask($task: TaskWithOutId!) {
            createTask(task: $task) {
                id
            }
        }`;
        fetch("http://127.0.0.1:4444/graphql/",{
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { task },
              })
        })
        .then(response => {
            loadTasks();
        })
        .catch(err => {alert(err)})
    }
    else {
        alert("Заполните все поля пожалуйста!");
    }
}

function deleteTask(event) {
    const target = event.target.closest('tr');
    const id = Number(target.dataset.task);
    console.log(id);
    var query = `mutation deleteTask($id: Int!) {
        deleteTask(id: $id) {
            id
        }
    }`;
    fetch("http://127.0.0.1:4444/graphql/",{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables: { id },
          })
    })
    .then(response => {
        loadTasks();
    })
    .catch(err => {alert(err)})
}

function updateTask(event) {
    const target = event.target.closest('tr');
    const id = Number(target.dataset.task);
    console.log(id);
    
    var query = `mutation updateTask($id: Int!) {
        updateTask(id: $id) {
            id
        }
    }`;
    fetch("http://127.0.0.1:4444/graphql/",{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables: { id },
          })
    })
    .then(response => {
        loadTasks();
    })
    .catch(err => {alert(err)})
}

function fillTasksTable(tasks) {
    console.log(tasks);
    let table = document.getElementById("tasksTable");
    clearTable(table);
    for (const task of tasks) {
        let row = table.insertRow();
        row.dataset.task = task.id;
        row.addEventListener('click', updateTask);
        
        let idCell = row.insertCell();
        idCell.append(task.id);

        let text = row.insertCell();
        text.append(task.text);

        let days = Math.round((new Date(task.endTime) - Date.now()) / (1000 * 3600 * 24)) + 1;

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

        let toDelete = row.insertCell();
        toDelete.addEventListener('click', deleteTask);
        toDelete.style.cursor = "pointer";
        toDelete.append("X");

    }
}

function clearTable(table) {
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}