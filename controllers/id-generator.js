function getId(list) {
    let ids = list.map((element) => {
        return element.id;
    });
    if (ids.length == 0) return 0;
    return Math.max(...ids) + 1;
}

module.exports = {
    getId: getId,
}