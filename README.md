# AnimalTracker

AnimalTracker is a NodeJS application to manage animal is research laboratories. It can also be used in animal houses.
OrientDB is the NoSQL database used in the application. It was chosen because of its extensibility and its flexibility.

All the application is based on a single configuration file. The database is created from this file, as all forms, datatables and the API. (see the Detailed functioning for more details)
Currently, the configuration is written to manage mice and rats. It is also possible to link the animals to projects.
The file structure is explained in the Configuration section.
The entire application is managed generically and dynamically thanks to this file.

## Getting started
Dependencies:

- [NodeJS 4.2.4 and latest](https://nodejs.org/en/download/)
- [OrientDB 2.1.10 and latest](http://orientdb.com/download/)

Once installed, the application should be available at http://localhost:3000/

### Development
```shell
# Retrieve sources
cd /path/to/install
git clone https://github.com/AnimalTracker/AnimalTracker
cd AnimalTracker

# Setup NodeJS dependencies
sudo npm install -g gulp bower nodemon
npm install

# Setup client-side dependencies
bower install

# Create the database
node util create-database

# Start the app
npm start
```

### Production
```shell
# Retrieve sources
cd /path/to/install
git clone https://github.com/AnimalTracker/AnimalTracker
cd AnimalTracker

# Setup NodeJS dependencies
npm install --production

# Setup client-side dependencies
bower install

# Create the database
node util create-database

# Start the app
npm run start:prod
```

## Configuration
The main configuration of the application is in the file `config/default.yml`.
```yaml
server:
  port: 3000
  static: true
  live_reload: true
```

## Detailed functioning
Every application's component is created dynamically with the configuration file : layout, forms, datatables and the API.
The API is used to fill the datatables but also to load forms and submit them.

## Database management
```shell
# This is how to create a database for the application
# The default name is animaltracker
# The credentials can be set in file utils.js in function createDatabase
node util create-database

# You can remove the database with this line
node util delete-database --db animaltracker [--exec]
```
