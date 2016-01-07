// Database setup script --
// Orientjs: https://www.npmjs.com/package/orientjs
// Command: https://github.com/75lb/command-line-commands

const config  = require('config');
const OrientDB = require('orientjs');
const commandLineCommands = require('command-line-commands');

// Define commands --
const cli = commandLineCommands([
  { name: 'check-server'},
  { name: 'list-database'},
  { name: 'create-database'},
  { name: 'delete-database', definitions: [ { name: 'db', type: String } ] }
]);

var displayHelp = function() {
  console.log('Available commands:');
  for(c of cli.commands) {
    console.log(' - ' + c.name);
  }
};

// Setup OrientDB --

var getParam = function(id, defaultValue) {
  if(config.has('database') && config.get('database').has(id))
    return config.get('database').get(id);

  console.log('[config] no database.'+ id +' field, fallback to default');
  return defaultValue;
};

var getServer = function() {
  return OrientDB({
    host:     getParam('host',      'localhost'),
    port:     getParam('port',      2424),
    username: getParam('username',  'root'),
    password: getParam('password',  'yourpassword')
  });
}

// Commands --
var checkServer = function() {
  var server = getServer();
  console.info('[util] Access to server: OK.');

  var db = server.use(getParam('dbname',  'genetracker'));
  console.info('[util] Access to db: OK.');
  server.

  server.close();
  console.info('[util] Connection closed. All clear!');
};

var listDatabase = function() {
  var server = getServer();
  console.info('[util] Access to server: OK.');

  server.list()
    .then(function(dbs) {
      console.log('[util] There are ' + dbs.length + ' databases on the server:');

      for(db of dbs) {
        console.log('[util]  - ' + db.name);
      }
    })
    .then(function() {
      server.close();
      console.info('[util] Connection closed.');
    });
};

var createDatabase = function() {
  var server = getServer();
  console.info('[util] Access to server: OK.');

  server.create({
      name: getParam('dbname',  'genetracker'),
      type: 'graph',
      storage: 'plocal'
    })
    .then(function(db) {
      console.info('[util] Database "' + db.name + '" created.');
    })
    .then(function() {
      server.close();
      console.info('[util] Connection closed.');
    });
};

// Apply commands --
const command = cli.parse();
switch (command.name) {
  case 'check-server':    checkServer();    break;
  case 'list-database':   listDatabase();   break;
  case 'create-database': createDatabase(); break;
  case 'delete-database':
    var dbname = command.options.db || '<dbname>'
    console.info('[util] The command there is the way to go:');
    console.info('node_modules/orientjs/bin/orientjs -s ' + getParam('password', '<password>') + ' db drop ' + dbname);
    break;
  default: displayHelp();
}
