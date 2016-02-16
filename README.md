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

Once installed, the application should be available at [http://localhost:3000/](http://localhost:3000/)

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

# Build CSS classes
gulp build

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
sudo npm install -g gulp bower pm2
npm install --production

# Setup client-side dependencies
bower install

# Build CSS classes
gulp build

# Create the database
node util create-database

# Start the app
npm run start:prod
```

## Configuration
The main configuration of the application is in the file `config/default.yml`.

### Server
The first part is about the NodeJS configuration. There are three parameters :

- port : port to expose the application (port-forwarding must be set in consequence)
- static : to choose if the server manage static content. Set `false` if Apache2 or Nginx does it.
- live_reload : reload the server every time the source code is modified

```yaml
server:
  port: 3000
  static: true
  live_reload: true
```

### Database
Then you have to configure database properties. If you generate the database, those credentials can be changed is the file `utils.js` on database creation.
Else you just have to put your own credentials.

```yaml
database:
  host: 'localhost'
  port: 2424
  username: 'root'
  password: 'yourpassword'
  dbname: 'animaltracker'
```

### Internationalization
In our case, this section is used to associate a language to its datatable language file. It can also be used to define a default language for the application.

```yaml
i18n:
  - id: fr
    datatable: French
    default: true
  - id: en
    datatable: English
```

### Data schema
The next and more important part is the `data_schema`. It contains all "entities" of the project, they are named `model`.
A model possess several attributes, and a list of properties.

```yaml
data_schema:
  models:
    - name: Rat
      type: animal
      path: rats
      path_base: animals
      datatable:
        toggle:
          - name: alive
            on: ?death=not_dead
            off:
            default: on
      property:
        - name: id
          type: text
          display_datatable: true
        [...]
```

Here are all the attributes and their values :

- name : mainly used to name the database's class names. Also used for logging.
- type : used to create some specific code for a class. Class' files are located in `src/models/configClass`. Different values are :
    - animal
    - other
    - user
- path : used for the page's path and also for the API.
- datatable/toggle : used to add toggle buttons to datatables. It has several properties :
    - name : used to link the button.
    - on/off: URL part to add to datatable source.
    - default : `on` or `off`. Default state of the button.

The last element is a list of properties. There are several properties for each one :

- name : property's name. Used to create attribute class' names in the database, and also form's inputs.
- type : there are several types available for each property. They are used during the database generation process and in form generation
    - text : simple text field. Another property can be used to disable the field except if a condition is fulfilled. In our case it is used to disable a field unless the value of the linked select is set on `other` :
        - display_only: {id: id, value: value}. Takes an object in input. Id the field if (e.g : select field ID's) and value is the value that will unlock the text field.
    - list : list of elements. Used to fill select inputs. Need a second property `list` which will contain a list of `id`. They represent every select values.
    - reference : reference to another class (e.g : the creator of a project will be references to `user`). It also needs other properties :
        - reference_to : class references to.
        - property_to_display : must be an array. Indicates what property to display from the referenced class (e.g : [ first_name, last_name ] for the project creator) 
        - accept_only : condition applied to the referenced object. Unable to save is the condition is not fulfilled.
            - id : property tested.
            - value : needed value (e.g : $user for current user)
            - role_exception : if there is an exception for a role 
    - date : date field. Used to load a datapicker in the input. It can possess other properties to automatically compute another field :
        - apply :
            - on : property that will be computed on change (defined un client-side javascript)
            - value : result of the field.
            - unit : unit that will be used (days, weeks, months, years).
    - number : simple number input. Generate an number input with arrow selectors. It can contain the same `apply` as a date field (e.g : the duration of a project)
    - computed : computed field. Used to compute the number of animals of a project. It needs other properties :
        - subtype : `reverse-reference` is for now the only choice.
        - reference_from : from which class the reference comes.
        - property : from which property of the class the reference comes.
    - password : generate in password input. The hash is also automatically computed is SHA-265.
- display_datatable : `true` or `false`. Indicates if this property will be displayed in the class datatable.

### Reports
This section is used to create additional reports.

```yaml
reports:
```

## Detailed functioning
Every application's component is created dynamically with the configuration file : layout, forms, datatables and the API.
The API is used to fill the datatables but also to load forms and submit them.

## Database management
To manage the database, several functions were developed. They are located in the file `util.js`.  

```shell
# Create a new database (default name is animaltracker)
# The credentials can be set in file utils.js in function createDatabase
node util create-database

# Remove the datatabase
node util delete-database --db animaltracker [--exec]

# Check server state
node util check-server 
```

## License
See [LICENSE](https://github.com/AnimalTracker/AnimalTracker/blob/master/LICENSE).
