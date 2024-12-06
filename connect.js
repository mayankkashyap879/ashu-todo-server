// here will write all the connecting like db or other 3 party platfrom.
const mongoose = require("mongoose");

async function ConnectDB(url) {
    return mongoose.connect(url);
}

module.exports = ConnectDB;