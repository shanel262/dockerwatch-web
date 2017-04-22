# Dockerwatch-web
Angular web app that pulls Docker container statistics from InfluxDB and displays them.
Dockerwatch-web is the frontend for the project, displaying projects and container statistics to authorised users. The server also handles the users and projects (using MongoDB to store user and project information), managing what users have access to specific projects and their permissions on the project. It communicates with InfluxDB to gather the statistics and information about containers. It uses Angular-nvd3 to produce the charts.

[![Build Status](https://travis-ci.org/shanel262/dockerwatch-web.svg?branch=master)](https://travis-ci.org/shanel262/dockerwatch-web)

How to run
How to configure
What it is
Licence

# How to run
1. Clone the repo using ```git clone https://github.com/shanel262/dockerwatch-web```
2. If MongoDB and InfluxDB are not accessible through localhost then insert the IP address in the config.yml file
3. Run ```npm install``` in the root directory
4. Run ```npm start``` to start the service on port 4000

# How to run tests
1. If MongoDB are not accessible through localhost then insert the IP address in the config.yml file
2. Run ```npm install``` in the root directory
3. Run ```npm test```

# How to see the test coverage
1. If MongoDB are not accessible through localhost then insert the IP address in the config.yml file
2. Run ```npm install``` in the root directory
3. Run ```npm run coverage```
4. The coverage report is produced in a directory called coverage in the root folder. Open the index.html file in your browser
