/*eslint-env node*/

const erisDbFactory = require('eris-db');
const erisContracts = require('eris-contracts');
const solc = require('solc');
const accounts = require("./accounts.js").accounts;
const nodes = require("./ips.js").ips;

var erisdb; /* ErisDB Factory */
var erisdbURL; /* ErisDB RPC URL */
var pipe; /* Pipe for creating contracts */
var contractManager;/* Contract Manager for creating contracts*/
var account = accounts[0].address;
var greeterSource = 'contract greeter { string greeting; function greeter(string _greeting) public { greeting = _greeting; } function greet() constant returns (string) { return greeting; } }'

/*Initialize ERISDB*/
erisdb = erisDbFactory.createInstance(nodes[0]);
erisdb.start(function(error){
    if(!error){
        console.log("Ready to go");
    }
});

pipe = new erisContracts.pipes.DevPipe(erisdb, accounts); /* Create a new pipe*/
contractManager = erisContracts.newContractManager(pipe); /*Create a new contract object using the pipe */

/*Get account list*/
erisdb.accounts().getAccounts((err, res) => { console.log(res.accounts.map(item => {
  return ({
    ADDR: item.address,
    BALANCE: item.balance
  })
})) });

/* Compile the Greeter Contract*/
var compiledContract = solc.compile(greeterSource);
console.log("Compiled Contract:" + compiledContract)
var contractFactory = contractManager.newContractFactory(JSON.parse(compiledContract.contracts.greeter.interface)); //parameter is abi
console.log("Contract Factory:" + contractFactory)

/* Send the contract */
contractFactory.new.apply(contractFactory, ["Hello World",
 {from: account, data:compiledContract.contracts.greeter.bytecode}, (err, contractInstance)=> {
  console.log(contractInstance.address);
  contractInstance["greet"].apply(contractInstance, [(error,result)=> {
     if (error) {
       console.log(error);
     }
    else {
      console.log(result);
    }
  }]);

 }]);





// Load the appropriate modules for the app
var cfenv = require("cfenv");
var express = require("express");
var bodyParser = require('body-parser');

// Defensiveness against errors parsing request bodies...
process.on('uncaughtException', function (err) {
    console.log('#### Caught exception: ' + err);
});
process.on("exit", function(code) {
    console.log("#### Exiting with code: " + code);
});

// Checking Bluemix setup
var appEnv = cfenv.getAppEnv();

// Configure the app web container
var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + '/public'));

// Finishing configuration of the app web container
app.listen(appEnv.port);
console.log("#### Server listening on port " + appEnv.port);

// Home page
app.get('/', function (req, res) 
{
      res.render('index', {compiledContract: compiledContract});   
});
