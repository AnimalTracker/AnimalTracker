// LNCA specific setup script --
// Orientjs: https://www.npmjs.com/package/orientjs
// Command: https://github.com/75lb/command-line-commands

const commandLineCommands = require('command-line-commands');
const Promise = require('bluebird');

const schema = require('./src/modules/schema');
const db = require('./src/modules/database');

schema.init();

// -- Define commands --

const cli = commandLineCommands([
  { name: 'fake-data'}
]);

var displayHelp = function() {
  console.log('Available commands:');
  for(c of cli.commands)
    console.log(' - ' + c.name);
};

// -- Commands --

var rand = function (low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low);
};

var randItem = function(items) {
  if(!items)
    throw new Error('[util] RandItem requires an array');
  return items[Math.floor(Math.random()*items.length)];
};

var getOptions = function(configClassName, result) {
  var configClass = schema.getConfigClass(configClassName);

  result[configClass.name] = {};
  var output = result[configClass.name];

  configClass.forEachProperty((property) => {
    if(property.type === 'list')
      output[property.name] = property.list;
  });
};

var populate = function(configClassName, number, fn) {
  var items = [];
  for(var i = 0; i < number; i++) {
    items.push(fn());
  }

  var configClass = schema.getConfigClass(configClassName);
  return configClass.createRecordsInDb(configClass.transformObjectsIntoRecords(items));
};

var fakeData = function() {
  var faker = require('faker');
  faker.locale = "fr";

  var records = { users: [], projects: [], rats: [], mus: [] };

  var options = {};
  getOptions('User', options);
  getOptions('Rat', options);
  getOptions('Mus', options);

  // Users --
  return populate('User', rand(20, 30), () => {
    var first_name = faker.name.firstName(), last_name = faker.name.lastName();
    var username = first_name.toLowerCase() + last_name.toLowerCase();
    return {
      username: username,
      password: username,
      role: randItem(options.User.role).id,
      first_name: first_name,
      last_name: last_name
    };
  }).then(function(users) {
    records.users = users;

    // Projects --
    return populate('Project', rand(50, 150), () => {
      return {
        id_apafis: 'APAFIS#' + faker.random.number(),
        creator: randItem(records.users).rid
      };
    });
  }).then(function(projects) {
    records.projects = projects;

    // Rats and Mice --
    return Promise.join(
      populate('Rat', rand(500, 1100), () => {
        return {
          strain:   randItem(options.Rat.strain).id,
          sex:      randItem(options.Rat.sex).id,
          id:       'RAT#' + faker.random.number(),
          origin:   randItem(options.Rat.origin).id,
          project:  randItem(records.projects).rid
        };
      }),
      populate('Mus', rand(500, 1100), () => {
        return {
          strain: '',
          lineage: '',
          genotype: '',
          sex:      randItem(options.Mus.sex).id,
          id:       'MOUSE#' + faker.random.number(),
          chip:     'CHIP#' + faker.random.number(),
          origin:   randItem(options.Mus.origin).id,
          project:  randItem(records.projects).rid
        };
      })
    );
  });
};

// -- Apply commands --

Promise.join(db.ready, schema.ready).then(function() {
  const command = cli.parse();
  switch (command.name) {
    case 'fake-data':
      return fakeData();
    default:
      return displayHelp();
  }
}).then(function() {
  process.exit(0);
});
