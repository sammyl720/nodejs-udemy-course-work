const Sequilize = require('sequelize');

const sequelize = new Sequilize('node-complete', 'root', '', {dialect: 'mysql', host: 'localhost'});

module.exports = sequelize;