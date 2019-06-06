/*******************************************************************************
 * This script implements the Supervisor View node application.
 * The Supervisor application can view product sales, department overhead, and
 * department profitability by department.
 *****************************************************************************/
const mysql = require("mysql");                 // Dependencies
const inquirer = require("inquirer");
const Table = require('cli-table');

const options = [                               // menu options
    "View product sales by department",
    "Create a new department",
    "Display departments",
    "Exit"
]

const connection = mysql.createConnection({     // Create database connection
    host: "localhost",
    port: 3306,
    user: "root",
    password: "del0r1sX",
    database: "bamazon"
});
connection.connect(function(err) {              // Connect to the database
    if (err) throw err;
  });

/*******************************************************************************
 * Display the menu and allow the user to select an action.
 *****************************************************************************/
function showMenu() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: options})
    .then(function(answer) {  
        switch (answer.action) {                
            case options[0]:                    // sales by dept
                displayDeptSales();
                break;
            case options[1]:                    // create dept
                createDept();
                break;
            case options[2]:
                displayDepts();
                break;
            case options[3]:                    // exit app
                connection.end();
                break;
        }
    });
}

/*******************************************************************************
 * Display department sales and profitability
 *****************************************************************************/
function displayDeptSales() {
    const query =                               // define query
        "SELECT products.department_name, " +
        "IFNULL(SUM(products.product_sales),0) AS sales, " +
        "departments.department_id, " +
        "departments.over_head_costs " +
        "FROM products " +
        "INNER JOIN departments On " +
        "products.department_name = departments.department_name " + 
        "GROUP BY department_name";
    connection.query(query, function(err, res) {  // join tables
        if (err) throw err;
        let table = new Table({                 // create table
            head: ["ID", "Dept Name", "Overhead", "Sales", "Profit"], 
            colWidths: [5,20,12,12,12]
        });
        for (let i = 0; i < res.length; i++) {  // fill table   
            let totalProfit =res[i].sales - res[i].over_head_costs;
            table.push(                         // add entry
                [res[i].department_id, res[i].department_name, res[i].over_head_costs, 
                res[i].sales, totalProfit.toFixed(2)]
            );
        }
        console.log(`\n${table.toString()}\n`);
        showMenu()
    });
}  

/*******************************************************************************
 * Display departments
 *****************************************************************************/
function displayDepts() {
    const query = "SELECT * from departments";  // define query
    const table = new Table({                   // create table for display
        head: ["ID", "Dept Name", "Overhead"],
        colWidths: [5, 20, 12]
    });
    connection.query(query, function(err, res) {    // run query
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {  // fill table
            table.push([res[i].department_id, res[i].department_name,
                res[i].over_head_costs]);
        }
        console.log(`\n${table.toString()}\n`);
        showMenu();
    });
}

/*******************************************************************************
 * Create a new department
 *****************************************************************************/
function createDept(){
    inquirer.prompt([{                          // get name
        name: "newdepartment",
        type: "input",
        message: "Name of new department",
        validate: function(value) {
            if (value.length === 0) {
                return false;
            }
        return true;
        }
    },{                                         // get overhead costs
        name: "overhead",
        type:"number",
        message: "Department overhead costs",
        validate: function(value) {
            if (value <= 0) {
                return false;
            }
            return true;
        }
    }])
    .then(function(answer) {
        const query =                           // define query
          "INSERT INTO departments(department_name, over_head_costs) VALUES (?, ?)";
        connection.query(query, [               // run query
            answer.newdepartment.toUpperCase(),
            answer.overhead],
            function(err, res) {
                if (err) throw err;
            })
    displayDepts();                             // display departments
    });  
}

/*******************************************************************************
 * Run application
 *****************************************************************************/
showMenu();