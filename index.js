const express = require('express');
const myRoutes = require('./routes/router');
const multer  = require("multer");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const PORT = 4444;

const app = express();

const http = require('http').createServer(app);

const io = require('socket.io').listen(http);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }    
});

app.use(multer({storage: storageConfig}).single("filedata")); //to read single file
app.use(express.urlencoded({ extended: true })) //to parse req body

app.use(cookieParser());

app.use(myRoutes);

function start() {
    app.listen(PORT, '127.0.0.1', () => {
        console.log("Server has been started");
    }).on("close", () => {        
        console.log("stop")      
    });
}

start();

const users = []
const connections = []
let tasks = []

//SOCKET PART
app.get("/socket", (req, res) => {
    res.sendFile(__dirname + "/socket.html");
});

io.on('connection', (socket) => {
    console.log("connection!");
    connections.push(socket);
    io.sockets.emit('fillTable', tasks);
    socket.on('disconnect', () => {
        console.log('user disconnected');
        connections.splice(connections.indexOf(socket), 1);
      });

    socket.on("createTask", (data) => {
        console.log(data);
        data.id = tasks.length + 1;
        data.completed = false;
        tasks.push(data);
        io.sockets.emit('fillTable', tasks);
    })
    socket.on("deleteTask", (id) => {
        console.log(id);
        console.log(tasks);
        tasks = tasks.filter(t => t.id != Number(id));
        console.log(tasks);
        io.sockets.emit('fillTable', tasks);
    });
    socket.on("updateTask", (id) => {
        let task = tasks.find(t => t.id == Number(id));
        if (task != undefined) {
            task.completed = !task.completed;
        }
        io.sockets.emit('fillTable', tasks);
    })
});

http.listen(5555, () => {
    console.log("Socket server started!");
});


