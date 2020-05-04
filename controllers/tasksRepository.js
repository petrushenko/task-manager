const fs = require('fs');
const Task = require('../models/task');
const User = require("../models/user");
const idGenerator = require('./id-generator');
const config = require("../config/config");

const USER_PATH = config.usersPath;
const PATH = config.tasksPath;

function getUsers() {
    let data = fs.readFileSync(USER_PATH, "utf8");
    let users = JSON.parse(data);
    var result = users.map(user => new User(
        user.id, 
        user.name, 
        user.password,
        user.tasks.map(task => new Task(task.text, task.endTime, task.filename, task.id, task.completed))));

    return result;
}

function getUserTaskById(userId, taskId) {
    const user = getUserById(userId);

    if (user == null) {
        return null;
    }

    let task = user.tasks.find(task => {
        if (task.id == taskId) {
            return true;
        }

        return false;
    });

    if (task != undefined) {
        return task;
    }

    return null;
}

function getUserByName(name) {
    let users = getUsers();
    let user = users.find(u => {
        if (u.name == name) {
            return true;
        }
        return false;
    });
    
    if (user) {
        return user
    }
    return null;
}

function getUserById(id) {
    let users = getUsers();
    let user = users.find(u => {
        if (u.id == id) {
            return true;
        }
        return false;
    });
    
    if (user) {
        return user
    }
    return null;
}

function createUserTask(userId, text, date, filepath) {
    let user = getUserById(userId);
    const task = new Task(text, new Date(date), filepath, idGenerator.getId(user.tasks), false);    
    user.tasks.push(task);
    updateUser(user);
}

function createUser(name, password) {
    let users = getUsers();

    if (getUserByName(name) != null) {
        return false;
    }

    let user = new User(idGenerator.getId(users), name, password, []);
    users.push(user);

    saveUsers(users);
    return true;
}

function saveUsers(users) {
    fs.writeFileSync(USER_PATH, JSON.stringify(users));
}

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

function deleteUserTask(userId, taskId) {
    let user = getUserById(userId);
    let task = getUserTaskById(userId, taskId);
    if (task != null && task.filename != undefined) {
        fs.unlink(task.filename, (err) => {
            console.log(err);
        });
    }
    if (user != null) {
        user.tasks = user.tasks.filter(t => t.id != taskId);
        updateUser(user);
    }
}

function updateUser(user) {
    let users = getUsers();

    let userEntity = getUserById(user.id);
    if (userEntity == null) {
        return null;
    }

    for(var k in user) {
        userEntity[k] = user[k];
    }

    const newUsers = users.map(u => u.id == user.id ? userEntity : u);
    saveUsers(newUsers);

    return userEntity;
}

function updateUserTask(userId, task, deleteFile) {
    let user = getUserById(userId);

    if (user == null) {
        return null;
    }

    let taskEntity = getUserTaskById(user.id, task.id);
    if (taskEntity == null) {
        return null;
    }

    if (deleteFile && taskEntity.filename != undefined) {
        fs.unlink(taskEntity.filename, (err) => {
            console.log(err);
        });
    }
    for(var k in task) {
        taskEntity[k] = task[k];
    }
    user.tasks = user.tasks.map(t => t.id == taskEntity.id ? taskEntity : t);
    updateUser(user);

    return user;
}

function updateTask(task, deleteFile) {
    const tasks = loadTasksFromJsonFile();
    let taskEntity = getTaskById(task.id);
    if (taskEntity == undefined) {
        return null;
    }

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
    delete: deleteTask,
    getUsers: getUsers,
    createUser: createUser,
    getUserByName: getUserByName,
    getUserById: getUserById,
    getUserTaskById: getUserTaskById,
    createUserTask: createUserTask,
    updateUserTask: updateUserTask,
    deleteUserTask: deleteUserTask
}