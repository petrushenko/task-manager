'use strict'

let tasks = []

function loadTasks() {
    fetch("http://127.0.0.1:4444/tasks/")
    .then(response => response.json())
    .then(tasks => {
        fillTasksTable(tasks);
    })
}

function fillTasksTable(tasks) {
    let table = document.getElementById("tasksTable");
    clearTable(table);
    for (const task of tasks) {
        let row = table.insertRow();
        row.setAttribute("draggable", "true");
        row.setAttribute("ondragstart", "return dragStart(event)");
        row.setAttribute("ondragend", "dragEnd(event)");
        row.dataset.task = task.id;

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
            } else if (days < 0){
                row.classList.add("expired-task");
                daysLeftText = "Дедлайн прошел!";
            }
            else {
                row.classList.add("non-completed-task");
                daysLeftText = days + "дня(ей)";
            }
        }

        let daysLeft = row.insertCell();
        daysLeft.append(daysLeftText);
        
        let investments = row.insertCell();
        if (task.filename != undefined) {
            let link = document.createElement("a");
            var linkText = document.createTextNode("скачать");
            link.appendChild(linkText);
            link.title = "download";
            link.href = task.filename;
            investments.appendChild(link);
        }
        else {
            investments.append("нет вложений");
        }

        let edit = row.insertCell();
        let img = document.createElement("img");
        img.classList.add("edit");
        img.src = "/public/img/edit.png";
        img.style.cursor = "pointer";
        img.addEventListener("click", editClick);
        edit.appendChild(img);
    }
}

function cancelEdit() {
    let form = document.getElementById("newTaskForm");
    form.classList.remove("deleted");
    let editForm = document.getElementById("editTaskForm");
    editForm.classList.add("deleted");
    document.forms.editTask.reset();
    document.forms.newTask.reset();
    let table = document.getElementById("tasksTable");
    table.classList.remove("deleted");
}

function edit() {
    let form = document.forms.editTask;
    let formData = new FormData(form);
    form.reset();
    fetch("http://127.0.0.1:4444/tasks/", {
        method: "PUT",
        body: formData
    })
    .then(response => {
        if (response.status != 200) {
            alert( 'Ошибка: ' + response.status);
            return;
        }
        let form = document.getElementById("newTaskForm");
        form.classList.remove("deleted");
        let editForm = document.getElementById("editTaskForm");
        editForm.classList.add("deleted");
        let table = document.getElementById("tasksTable");
        table.classList.remove("deleted");
        loadTasks();
    });
}

function editClick(e) {
    let form = document.getElementById("newTaskForm");
    form.classList.add("deleted");
    let editForm = document.getElementById("editTaskForm");
    editForm.classList.remove("deleted");
    let table = document.getElementById("tasksTable");
    table.classList.add("deleted");

    let deleteFile = document.getElementById("deleteFile");
    deleteFile.value = false;

    let target = e.target.closest('tr');
    let id = target.dataset.task;
    console.log("CLICKED edit task id: " + id);
    let taskId = document.getElementById("taskId");
    let text = document.getElementById("taskText");
    let date = document.getElementById("taskDate");
    let file = document.getElementById("taskFile");
    file.innerHTML = "";
    let completed = document.getElementById("completed");
    fetch("http://127.0.0.1:4444/tasks/" + id)
    .then(response => response.json())
    .then(task => {
        console.log(task);
        taskId.value = task.id;
        text.value = task.text;
        let taskDate = new Date(task.endTime);
        date.value = getDateString(taskDate);
        completed.checked = task.completed;
        if (task.filename != undefined) {
            let link = document.createElement("div");
            var linkText = document.createTextNode("Скачать");
            link.appendChild(linkText);
            link.dataset.file = task.filename;
            link.className = "btn btn-info";
            link.addEventListener("click", downloadFile);

            let deleteDiv = document.createElement("div");
            var deleteText = document.createTextNode("Удалить");
            deleteDiv.className = "btn btn-info";
            deleteDiv.appendChild(deleteText);
            deleteDiv.addEventListener("click", setFieldToDeleteFile);
            file.appendChild(deleteDiv);
            file.appendChild(link);
        }
        else {
            file.append("нет вложений");
        }
    });
}

function downloadFile(e) {
    let link = e.target.dataset.file;
    console.log("DOWNLOAD: " + link);
    let element = document.createElement('a');
    element.href = link;

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function setFieldToDeleteFile() {
    console.log("here");
    let deleteFile = document.getElementById("deleteFile");
    deleteFile.value = true;

    let file = document.getElementById("taskFile");
    file.innerHTML = "нет вложений";
}

function getDateString(date) {
    let dd = date.getDate();
    let mm = date.getMonth()+1; 
    const yyyy = date.getFullYear();
    if(dd<10) 
    {
        dd=`0${dd}`;
    } 

    if(mm<10) 
    {
        mm=`0${mm}`;
    } 
    return `${yyyy}-${mm}-${dd}`;
}

function createTask() {
    let form = document.forms.newTask;
    let formData = new FormData(form);
    form.reset();

    fetch("http://127.0.0.1:4444/tasks/", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (response.status != 200) { 
            alert( 'Ошибка: ' + response.status);
            return;
          }
        
          loadTasks();
    });
}

function deleteTask(id) {
    console.log("DELETE ID:" + id);

    fetch("http://127.0.0.1:4444/tasks/" + id, {
        method: "DELETE"
    })
    .then(response => {
        if (response.status != 200) { 
            alert( 'Ошибка: ' + response.status);
            return;
          }
          
        loadTasks();
    });
}

function clearTable(table) {
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}

function dragStart(ev) {
    let form = document.getElementById("newTaskForm");
    let img = document.getElementById("imgTrash");
    setTimeout(() => {
        form.classList.add("deleted")
        img.classList.remove("deleted")
    }, 0);
    // form.classList.add("deleted"); ????????????

    ev.dataTransfer.effectAllowed='move';
    ev.dataTransfer.setData("Text", ev.target.dataset.task);
    return true;
 }

 function dragEnter(ev) {
    console.log();
    ev.target.style.backgroundColor = "slategray";
    event.preventDefault();
    return true;
 }

 function dragOver(ev) {
    //ev.target.style.border = "none";
    return false;
 }

 function dragLeave(ev) {
    ev.target.style.backgroundColor = "";
 }

 function dragEnd(ev) {
    let form = document.getElementById("newTaskForm");
    let img = document.getElementById("imgTrash");
    form.classList.remove("deleted")
    img.classList.add("deleted")
 }

 function dragDrop(ev) {
    var src = ev.dataTransfer.getData("Text");
    //ev.target.appendChild(document.getElementById(src));
    deleteTask(src);
    ev.stopPropagation();
    return false;
 }

loadTasks();