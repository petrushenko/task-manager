const Task = class {
    constructor(text, endTime, filename, id, completed) {
        this.id = id;
        this.text = text;
        this.endTime = endTime;
        this.filename = filename
        this.completed = completed;
    }
} 


module.exports = Task;