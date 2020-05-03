const router = require('express').Router();
const tasksStorage = require('../controllers/tasksRepository');
const path = require('path');

router.get('/', (req, res) => {
    var tasks = tasksStorage.getAll();
    res.render('index', 
    { 
        title: 'My Tasks',
        tasks: tasks
    });
});

router.get('/tasks', (req, res) => {
    var tasks = tasksStorage.getAll();
    res.send(tasks);
});

router.get("/tasks/:id", (req, res) => {
    var task = tasksStorage.get(Number(req.params.id));
    if (task != null) {
        res.send(task);
    }
    else {
        res.sendStatus(404);
    }
});

router.post("/tasks", (req, res) => {

    console.log(req.body);

    let filedata = req.file;
    let filepath = undefined;
    if (filedata) {
        filepath = path.join("uploads/", filedata.filename);
    }   
    if (!req.body.endTime || !req.body.text) {
        res.sendStatus(405);
        return;
    }
    let task = tasksStorage.create(req.body.text, req.body.endTime, filepath);

    res.send(task);
});

router.put("/tasks", (req, res) => {
    let filedata = req.file;
    let filepath = undefined;
    if (filedata) {
        filepath = path.join("uploads/", filedata.filename);
    } 

    let body = req.body;
    let task = {};
    
    task.id = Number(body.id);
    task.text = body.text;
    task.endTime = new Date(body.endTime);
    if (body.completed != undefined) {
        task.completed = true;
    } 
    else {
        task.completed = false;
    }

    if (filepath != undefined) {
        task.filename = filepath;
    }
    console.log(body.deleteFile);
    let deleteFile = body.deleteFile == "true";
    console.log(deleteFile);
    if (deleteFile) {
        task.filename = undefined;
    }
    let result = tasksStorage.updateTask(task, deleteFile);

    if (result != null) {
        res.send();
        return;
    }

    res.sendStatus(405);
});

router.delete("/tasks/:id", (req, res) => {
    let id = Number(req.params.id);
    tasksStorage.delete(id);
    res.sendStatus(200);
})

router.get('/create', (req, res) => {
    res.render('create', {title: 'Create'});
});

router.post('/create', (req, res) => {
    let filedata = req.file;
    let filepath = undefined;
    if (filedata) {
        filepath = path.join("uploads/", filedata.filename);
    }   
    if (!req.body.date) res.render();
    tasksStorage.create(req.body.text, req.body.date, filepath);
    res.redirect('/');
});

router.post('/complete', (req, res) => {
    const task = tasksStorage.get(req.body.id);
    task.completed = !task.completed;
    tasksStorage.updateTask(task);
    res.redirect('/');
})

router.get('/uploads/:file', (req,res) => {
    res.download(path.join('uploads/', req.params.file));
})

router.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "..", 'views/main.html'));
})

module.exports = router;