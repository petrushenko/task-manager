const fs = require('fs');
const Task = require('../models/task');
const idGenerator = require('./id-generator');
const config = require("../config/config");


const PATH = config.tasksPath;

function loadTasksFromJsonFile() {
    const data = fs.readFileSync(PATH, "utf8");
    let tasks = JSON.parse(data);
    return tasks.map((element) => {
        return new Task(element.text, element.endTime, element.filename, element.id, element.completed);
    });
}

function saveTasksToJsonFile(tasks) {
    fs.writeFileSync(PATH, JSON.stringify(tasks));
}

function addTasksToJsonFile(text, date, filepath) {
    const tasks = loadTasksFromJsonFile();
    const task = new Task(text, new Date(date), filepath, idGenerator.getId(tasks), false);    
    tasks.push(task);
    saveTasksToJsonFile(tasks);

    return task;
}

function getTaskById(id) {
    const tasks = loadTasksFromJsonFile();
    const task = tasks.find((element) => {
        if (element.id == id) return true;
        return false;
    });

    if (task == undefined) {
        return null;
    }

    return new Task(task.text, task.endTime, task.filename, task.id, task.completed);
}

function updateTask(task, deleteFile) {
    const tasks = loadTasksFromJsonFile();
    let taskEntity = getTaskById(task.id);
    if (taskEntity == undefined) {
        return null;
    }

    //console.log(deleteFile);
    if (deleteFile && taskEntity.filename != undefined) {
        fs.unlink(taskEntity.filename, (err) => {
            console.log(err);
        });
    }
    for(var k in task) {
        taskEntity[k] = task[k];
    }
    const newTasks = tasks.map((element) => {
        return element.id === task.id ? taskEntity : element
    });
    saveTasksToJsonFile(newTasks);

    return taskEntity;
}

function deleteTask(id) {
    var task = getTaskById(id);
    if (task != null && task.filename != undefined) {
        fs.unlink(task.filename, (err) => {
            console.log(err);
        });
    }

    const tasks = loadTasksFromJsonFile();
    const newTasks = tasks.filter(task => task.id != id);

    saveTasksToJsonFile(newTasks);
}

module.exports = {
    getAll: loadTasksFromJsonFile, 
    saveTasksToJsonFile: saveTasksToJsonFile,   
    create: addTasksToJsonFile,
    get: getTaskById,
    updateTask: updateTask,
    delete: deleteTask
}