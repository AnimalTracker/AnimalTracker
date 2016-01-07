# GeneTracker
## Getting started
### Developpement
Dependencies:
- [NodeJS 4.2.4 and latest](https://nodejs.org/en/download/)

Setup:

```shell
# Retrieve sources
cd /path/to/install
git clone https://github.com/GeneTracker/GeneTracker
cd GeneTracker

# Setup NodeJS dependencies
sudo npm install -g gulp bower
npm install

# Start the app
npm start

# Create the database
node util create-database

# (optional) Remove the database
node util delete-database --db genetracker [--exec]
```

### Production
Dependencies:
- [NodeJS 4.2.4 and latest](https://nodejs.org/en/download/)

Setup:

```shell
# Retrieve sources
cd /path/to/install
git clone https://github.com/GeneTracker/GeneTracker
cd GeneTracker

# Setup NodeJS dependencies
npm install --production

# Start the app
npm run start:prod
```
