const router = require('express').Router();
const tasksStorage = require('../controllers/tasksRepository');
const path = require('path');
const User = require("../models/user");
const jwt = require("jsonwebtoken");

router.get('/', (req, res) => {
    var tasks = tasksStorage.getAll();
    res.render('index', 
    { 
        title: 'My Tasks',
        tasks: tasks
    });
});

router.get('/users', (req, res) => {
    res.send(tasksStorage.getUsers());
});

router.post("/api/register", (req, res) => {
    const body = req.body;
    if (!body.name || !body.password) {
        res.status(405).json({error: "Please fill all fileds!"})
    }

    if (tasksStorage.createUser(body.name, body.password)) {
        res.redirect("/home");
        //перенаправить на авторизация
    }
    else {
        res.status(405).json({error: "User already exists"})
    }
});

router.post("/api/login", (req, res) => {
    const body = req.body;
    console.log(body);
    let user = tasksStorage.getUserByName(body.name);
    if (user == null) {
        res.status(404).send({error: "user not found"});
        return;
    }
    if (body.password != user.password) {
        res.status(401).send({error: "wrong password"});
        return;
    }

    //token
    const token = jwt.sign({id: user.id}, "SECRET");

    res.cookie("token", token, {
        //expires: new Date(Date.now() + 360),
        secure: false,
        httpOnly: true,
    }).send({token: token});
})

router.get("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/home");
});

router.get('/tasks', verifyToken, (req, res) => {

    const user = tasksStorage.getUserById(req.user.id);
    var tasks = user.tasks;

    //var tasks = tasksStorage.getAll();
    res.send(tasks);
});

router.get("/tasks/:id", verifyToken, (req, res) => {
    var task = tasksStorage.getUserTaskById(req.user.id, Number(req.params.id));
    if (task != null) {
        res.send(task);
    }
    else {
        res.sendStatus(404);
    }
});

router.post("/tasks", verifyToken, (req, res) => {

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

    const update = tasksStorage.createUserTask(req.user.id, req.body.text, req.body.endTime, filepath) 

    res.send(update);
});

router.put("/tasks", verifyToken, (req, res) => {
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
    let deleteFile = body.deleteFile == "true";
    if (deleteFile) {
        task.filename = undefined;
    }

    console.log(task);
    let result = tasksStorage.updateUserTask(req.user.id, task, deleteFile);

    if (result != null) {
        res.sendStatus(200);
        return;
    }

    res.sendStatus(405);
});

router.delete("/tasks/:id", verifyToken, (req, res) => {
    let id = Number(req.params.id);
    tasksStorage.deleteUserTask(req.user.id, id);
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

router.get("/home", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "..", 'views/main.html'));
});

router.get("/auth", (req, res) => {
    res.sendFile(path.join(__dirname, "..", 'views/auth.html'));
})

router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "..", 'views/register.html'));
})

router.get("/graph", (req, res) => {
    res.sendFile(path.join(__dirname, "..", 'graph.html'));
})

function verifyToken(req, res, next) {
    const token = req.cookies.token || "";
    try {
        if (!token) {
            return res.status(401).redirect("/auth");
        }
        const decrypt = jwt.verify(token, "SECRET");
        req.user = {id: decrypt.id};
        next();
    } catch (err) {
        return res.status(500).json(err.toString());
    }
}


module.exports = router;