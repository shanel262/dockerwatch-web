# Dockerwatch-web
Angular web app that pulls Docker container statistics from InfluxDB and displays them.
Dockerwatch-web is the frontend for the project, displaying projects and container statistics to authorised users. The server also handles the users and projects (using MongoDB to store user and project information), managing what users have access to specific projects and their permissions on the project. It communicates with InfluxDB to gather the statistics and information about containers. It uses Angular-nvd3 to produce the charts.

[![Build Status](https://travis-ci.org/shanel262/dockerwatch-web.svg?branch=master)](https://travis-ci.org/shanel262/dockerwatch-web)

## How to run
1. Clone the repo using ```git clone https://github.com/shanel262/dockerwatch-web```
2. If MongoDB and InfluxDB are not accessible through localhost then insert the IP address in the config.yml file
3. Run ```npm install``` in the root directory
4. Run ```npm start``` to start the service on port 4000

**To add a container to a project, it must first exist in InfluxDB (start dockerwatch-stats first to ensure it will exist)**

## How to run tests
1. If MongoDB is not accessible through localhost then insert the IP address in the config.yml file
2. Run ```npm install``` in the root directory
3. Run ```npm test```

## How to see the test coverage
1. If MongoDB is not accessible through localhost then insert the IP address in the config.yml file
2. Run ```npm install``` in the root directory
3. Run ```npm run coverage```
4. The coverage report is produced in a directory called coverage in the root folder. Open the index.html file in your browser

## Change MongoDB database to connect to
The name of the database is located in the root directory in a file called app.js. By default the database is called 'dockerwatch' but that can be changed by editing the name in the line:
```
mongoose.connect('mongodb://' + config.database + '/dockerwatch');
```

## Change InfluxDB database to connect to
The name of the database is located in the /api/stats/ directory in a file called stats.controller.js. By default the database is called 'dockerwatch' but that can be changed by editing the name in the line:
```
database: 'dockerwatch'
```
