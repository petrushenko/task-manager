const express = require('express');
const myRoutes = require('./routes/router');
const multer  = require("multer");
const bodyParser = require('body-parser');

const PORT = 4444;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.use('/public', express.static('public'))

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

app.use(myRoutes);

function start() {
    app.listen(PORT, '127.0.0.1', () => {
        console.log("Server has been started");
    }).on("close", () => {        
        console.log("stop")      
    });
}

start();
