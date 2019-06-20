// connect to mongoDb
const mongoDb = require('mongodb');
const mongoClient = mongoDb.MongoClient;

let _db;
const mongoConnect = (callback) => {
  //connect to mongoDb using these credentails
  
  mongoClient.connect('mongodb+srv://samuel:YgNzAxSKUYb9a00v@cluster0-bkybb.mongodb.net/shop?retryWrites=true&w=majority', { useNewUrlParser: true })

  .then(client => {
    console.log('connected');
    // return mongo client on connection success
    _db = client.db();
    callback();
  })
  .catch(err => {
    console.log("error on database connection");
    console.log(err);
    throw err;
  })
}
const getDb = () =>{
  if(_db){
    return _db;
  }
  throw 'No Database Found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;