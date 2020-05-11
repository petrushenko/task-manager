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

//GRAPHQL
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
    type Query {
        tasks: [Task!]!
    }

    type Mutation {
        createTask(task: TaskWithOutId!): Task
        updateTask(id: Int!): Task
        deleteTask(id: Int!): Task
    }
    
    input TaskWithOutId {
        text: String!
        endTime: String!
    }

    type Task {
        id: Int!
        text: String!
        endTime: String!
        completed: Boolean!
    }
`);


const tasksStorage = require('./controllers/tasksRepository');

var root = {
    tasks: () => {
        var tasks = tasksStorage.getAll();
        console.log(tasks);
        return tasks;
    },
    createTask: (task) => {
        console.log(task);
        var created = tasksStorage.create(task.task.text, new Date(task.task.endTime));
        return created;
    },
    updateTask: (id) => {
        console.log(id.id);

        let task = tasksStorage.get(id.id);
        task.completed = !task.completed;
        tasksStorage.updateTask(task);
        return task;
    },
    deleteTask: (id) => {
        console.log(id);
        tasksStorage.delete(id.id);
        return id;
    }
};

app.use('/graphql/', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));






