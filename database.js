const { MongoClient } = require("mongodb");

const MongoDB_Client = new MongoClient(process.env.MONGODB_URI);

MongoDB_Client.connect().then(async () => {
    console.log("✅ | :: MongoDB - (Verification) :: | Connection to database established!")
}).catch(() => {
    console.log("🛑 | :: MongoDB - (Verification) :: | Connection to database failed!")
});

module.exports = MongoDB_Client;
