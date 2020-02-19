const Task = class {
    constructor(text, endTime, filename, id, completed) {
        this.id = id;
        this.text = text;
        this.endTime = endTime;
        this.filename = filename
        this.completed = completed;
    }
    
    get daysLeft() {
        return Math.ceil((new Date(this.endTime) - Date.now()) / (1000 * 3600*24));
    }
} 


module.exports = Task;