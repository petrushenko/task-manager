const router = require('express').Router();
const tasksStorage = require('../controllers/tasks-storage');
const path = require('path')

const config = require('../config/config');



router.get('/', (req, res) => {
    var tasks = tasksStorage.loadTasksFromJson(config.tasksPath); //to config
    //console.log(tasks);
    res.render('index', 
    { 
        title: 'My Tasks',
        tasks: tasks
    });
});

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
    tasksStorage.addTasksToJsonFile(config.tasksPath, req.body.text, req.body.date, filepath);
    res.redirect('/');
});

router.post('/complete', (req, res) => {
    const task = tasksStorage.getTaskById(req.body.id, config.tasksPath);
    task.completed = !task.completed;
    tasksStorage.updateTask(task, config.tasksPath);
    res.redirect('/');
})

router.get('/uploads/:file', (req,res) => {
    res.download(path.join('uploads/', req.params.file));
})

module.exports = router;