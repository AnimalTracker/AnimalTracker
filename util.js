// Database setup script --
// Orientjs: https://www.npmjs.com/package/orientjs
// Command: https://github.com/75lb/command-line-commands

const config  = require('config');
const commandLineCommands = require('command-line-commands');

// -- Config --

var getParam = function(id, defaultValue) {
  if(config.has('database') && config.get('database').has(id))
    return config.get('database').get(id);

  console.log('[config] no database.'+ id +' field, fallback to default');
  return defaultValue;
};

// -- Define commands --

const cli = commandLineCommands([
  { name: 'check-server'},
  { name: 'list-database'},
  { name: 'create-database'},
  { name: 'delete-database', definitions: [
    { name: 'db', type: String },
    { name: 'exec', type: Boolean }
  ]}
]);

var displayHelp = function() {
  console.log('Available commands:');
  for(c of cli.commands) {
    console.log(' - ' + c.name);
  }
};

// -- Commands --

var checkServer = function() {
  var db = require('./src/modules/database');

  db.ready.then(function() {
    db.close();
  });
};

var listDatabase = function() {
  var db = require('./src/modules/database');

  db.srv.list()
    .then(function(dbs) {
      console.log('[util] There are ' + dbs.length + ' databases on the server:');

      for(db of dbs) {
        console.log('[util]  - ' + db.name);
      }
    })
    .then(function() {
      db.close();
    });
};

var createDatabase = function() {
  var OrientDB = require('orientjs');
  var server = OrientDB({
    host:     getParam('host',      'localhost'),
    port:     getParam('port',      2424),
    username: getParam('username',  'root'),
    password: getParam('password',  'yourpassword'),
    enableRIDBags: false
  });

  console.info('[util] Begin the creation of the database');

  return server.create({
    name:     getParam('dbname',    'genetracker'),
    type: 'graph',
    storage: 'plocal'
  }).then(function(db) {
    console.info('[util] Database "' + db.name + '" created.');
    db.close();
  }).then(function() {
    var db = require('./src/modules/database'),
        schema = {};
    db.ready
      .then(function() {
        schema = require('./src/modules/schema');
        return schema.init();
      })
      .then(function(){
        return require('./src/helpers/databaseCreation').populateDatabase();
      })
      .then(function() {
        var faker = require('faker');
        faker.locale = "fr";

        return schema.user.createFromObject([
          { username: 'test',  password: 'test', role: 'admin', language: 'fr',
            first_name: faker.name.firstName(), last_name: faker.name.lastName()},
          { username: 'demo',  password: 'demo', role: 'admin', language: 'fr',
            first_name: faker.name.firstName(), last_name: faker.name.lastName()},
          { username: 'admin',  password: 'admin', role: 'admin', language: 'fr',
            first_name: faker.name.firstName(), last_name: faker.name.lastName()},
          { username: 'project_manager',  password: 'project_manager', role: 'project_manager', language: 'fr',
            first_name: faker.name.firstName(), last_name: faker.name.lastName()},
          { username: 'viewer',  password: 'viewer', role: 'viewer', language: 'fr',
            first_name: faker.name.firstName(), last_name: faker.name.lastName()},
        ]);
      })
    .then(function() {
      db.close();
      process.exit(0);
    });
  });
};

var deleteDatabase = function(command) {
  var arg = {
    dbname: command.options.db || '<dbname>',
    password: getParam('password', '<password>')
  };
  var cmd = 'node_modules/orientjs/bin/orientjs -s ' + arg.password + ' db drop ' + arg.dbname;

  if(command.options.exec) {
    if(arg.dbname == '<dbname>') {
      console.error('[util] Database name is missing (--db DatabaseName)');
      return;
    }

    if(arg.password == '<password>') {
      console.error('[util] Password is missing (in config/)');
      return;
    }

    console.info('[util] ' + cmd);
    require('child_process').exec(cmd, (error, out, err) => {
      if(error) {
        console.error(err);
        process.exit(0);
      }
      else
        console.log(out);
    });
  }
  else {
    console.info('[util] The command there is the way to go:');
    console.info(cmd);
  }
};

// -- Apply commands --
const command = cli.parse();
switch (command.name) {
  case 'check-server':    checkServer();            break;
  case 'list-database':   listDatabase();           break;
  case 'create-database': createDatabase();         break;
  case 'delete-database': deleteDatabase(command);  break;

    break;
  default: displayHelp();
}
