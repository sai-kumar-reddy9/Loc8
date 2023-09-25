const mongoose = require('mongoose');
const readLine = require('readline');

let dbURL = 'mongodb://127.0.0.1:27017/Loc8';

if (process.env.NODE_ENV === 'production') {
  dbURL = process.env.DB_HOST || process.env.MONGODB_URI;
}

const connect = () => {
  mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Replace useCreateIndex with useUnifiedTopology
  });
};

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Error: ' + err);
  // Reconnect on error
  connect();
});

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from MongoDB');
});

if (process.platform === 'win32') {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on('SIGINT', () => {
    process.emit('SIGINT');
  });
}

const gracefulShutdown = (msg, callback) => {
  mongoose.connection.close(() => {
    console.log(`Mongoose disconnected through ${msg}`);
    callback();
  });
};

process.once('SIGUSR2', () => {
  gracefulShutdown('nodemon restart', () => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', () => {
  gracefulShutdown('app termination', () => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  gracefulShutdown('Heroku app shutdown', () => {
    process.exit(0);
  });
});

// Call the connect function to initiate the connection
connect();

module.exports = mongoose.connection;
