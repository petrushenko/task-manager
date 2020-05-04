const User = class {
    constructor(id, name, password, tasks) {
        this.id = id;
        this.name = name;
        this.tasks = tasks;
        this.password = password;
    }
}

module.exports = User;