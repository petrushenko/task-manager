const fs = require('fs');
const Task = require('../models/task');
const idGenerator = require('../controllers/id-generator');

function loadTasksFromJsonFile(path) {
    const data = fs.readFileSync(path, "utf8");
    let tasks = JSON.parse(data);
    return tasks.map((element) => {
        return new Task(element.text, element.endTime, element.filename, element.id, element.completed);
    });
}

function saveTasksToJsonFile(path, tasks) {
    fs.writeFileSync(path, JSON.stringify(tasks));
}

function addTasksToJsonFile(path, text, date, filepath) {
    const tasks = loadTasksFromJsonFile(path);
    const task = new Task(text, new Date(date), filepath, idGenerator.getId(tasks), false);    
    tasks.push(task);
    saveTasksToJsonFile(path, tasks);
}

function getTaskById(id, path) {
    const tasks = loadTasksFromJsonFile(path);
    const task = tasks.find((element) => {
        if (element.id == id) return true;
        return false;
    });
    return new Task(task.text, task.endTime, task.filepath, task.id, task.completed);
}

function updateTask(task, path) {
    const tasks = loadTasksFromJsonFile(path);

    const newTasks = tasks.map((element) => {
        return element.id === task.id ? task : element
    });
    
    saveTasksToJsonFile(path, newTasks);
}

module.exports = {
    loadTasksFromJson: loadTasksFromJsonFile, 
    saveTasksToJsonFile: saveTasksToJsonFile,   
    addTasksToJsonFile: addTasksToJsonFile,
    getTaskById: getTaskById,
    updateTask: updateTask
}