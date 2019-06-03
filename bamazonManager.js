/******************************************************************************
 * This script implements the Manager View node application.
 * A menu is provided to allow the manager to view all products for sale,
 * view products with a low inventory level, add to the inventory of an item,
 * or add a new product to the database.
 *****************************************************************************/
const mysql = require("mysql");                 // dependencies
const inquirer = require("inquirer");
const Table = require('cli-table');

const menuSelections = [                        // main menu selections
  "View all products for sale",
  "View products with a low inventory",
  "Add inventory to an item",
  "Add a new product",
  "Exit the application"
];

const lowInventory = 5;                         // low inventory threshhold
const displayWidth = 80;

/******************************************************************************
 * Create the database connection, and connect to the database.
 *****************************************************************************/
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "del0r1sX",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
  });

/******************************************************************************
 * Display the main menu, and allow the user to select an action to perform.
 *****************************************************************************/
function mainMenu() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "Select an action to perform: ",
        choices: menuSelections
    })
    .then(function(answer) {                    // menu branch table 
        switch (answer.action) {
            case menuSelections[0]:             // display all products
                readProducts();
                break;
            case menuSelections[1]:             // display low inventory
                lowQuantity();
                break;
            case menuSelections[2]:             // add inventory
                addInventory();
                break;
            case menuSelections[3]:             // add product
                addNew();
                break;
            case menuSelections[4]:             // exit app
                connection.end();
                break;
        }
      });
  }

/******************************************************************************
 * Display products.
 *****************************************************************************/
function show() {
    const query =                               // define query
        "SELECT item_id, " +
        "IFNULL(product_name,'n/a') AS name, " +
        "IFNULL(department_name,'n/a') AS dept, " +
        "IFNULL(price,'0') AS cost, " +
        "IFNULL(stock_quantity,'0') AS amount " +
        "FROM products";  
    connection.query(query, function(err, res) {  // run query
        if (err) throw err;
        let table = new Table({                 // create table
            head: ["ID", "Product", 'Department', "Price $", "Quantity"], 
            colWidths: [5, 30, 20, 10, 7]
        });
        for (let i = 0; i < res.length; i++) {   
            table.push([res[i].item_id, res[i].name, res[i].dept, 
                res[i].cost, res[i].amount]);
        }
        console.log(`\n${table.toString()}\n`);
    });
} 

/******************************************************************************
 * Read all the products, and display them to the console as a table.
 *****************************************************************************/
function readProducts() {
    const query =                               // build query
        "SELECT item_id, " +
        "IFNULL(product_name,'n/a') AS name, " +
        "IFNULL(department_name,'n/a') AS dept, " +
        "IFNULL(price,'0') AS cost, " +
        "IFNULL(stock_quantity,'0') AS amount " +
        "FROM products";
    connection.query(query, function(err, res) {  // run query
        if (err) throw err;
        let table = new Table({                 // define table
            head: ["ID", "Product", 'Department', "Price $", "Quantity"], 
            colWidths: [5, 30, 20, 10, 7]
        });
        for (let i = 0; i < res.length; i++) {  // add items to table   
            table.push([res[i].item_id, res[i].name, res[i].dept, 
            res[i].cost, res[i].amount]);
        }
        console.log(`\n${table.toString()}\n`); // display table
        mainMenu();                             // run main menu
    });
  }  

/******************************************************************************
 * Read all the products, and display those with a low inventory to the console 
 * as a table.
 *****************************************************************************/
function lowQuantity() {
    connection.query(                           // run low inventory query
        "SELECT * " +
        "FROM products " +
        "WHERE stock_quantity < ?", lowInventory, function(err, res) {
        if (err) throw err
        let table = new Table({                 // define table
            head: ["ID", "Product", 'Department', "Price $", "Quantity"], 
            colWidths: [5, 30, 20, 10, 7]
        });
        if (res.length === 0) {
            console.log(`\n${"_".repeat(displayWidth)}\n`);
            console.log("NO ITEMS HAVE A LOW INVENTORY...\n");
        } else {
            for (let i = 0; i < res.length; i++) {  // add items to table
                table.push([res[i].item_id, res[i].product_name, 
                  res[i].department_name, res[i].price, res[i].stock_quantity]);
            }
            console.log(`\n${table.toString()}\n`); // display table
        }
        mainMenu();                             // run main menu
    });
}  

/******************************************************************************
 * The user has selected to add to the inventory. Select an item, and then
 * add the inventory.
 *****************************************************************************/
function addInventory() {
    show();                                     // display products
    console.log("");
    inquirer.prompt([{                          // get item to update
        name: "idSelect",
        type: "number",
        message: "Select product to add inventory by ID",
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
        return false;
        }
    },{                                         // get quantity to add
        name: "quantity",
        type:"number",
        message: "How many would you like to add?",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
        }
    }]).then(function(answer) {
        const query =                           // define query
            "SELECT item_id, " +
            "product_name, " +
            "price, " +
            "stock_quantity " +
            "FROM products " +
            "WHERE item_id = ?";    
        connection.query(query, answer.idSelect, function(err, res) {
            if (err) throw err;
            else if (!res.length) {             // invalid id
                console.log(`\n${"_".repeat(displayWidth)}`);
                console.log("\n!NO ITEM SELECETED CHECK ITEM ID NUBMER!");
                addInventory()
            } else {                            // update quantity
                const query2 = 
                  "UPDATE products " +
                  "SET stock_quantity = stock_quantity + ? " +
                  "WHERE item_id = ?";
                connection.query(query2, [answer.quantity, answer.idSelect], function(err, res) {
                    if (err) throw err;
                    console.log("\r\n");  
                    readProducts();       
            })
        }
      });
  });
} 

/******************************************************************************
 * Add a new product
 *****************************************************************************/
function addNew() {
    inquirer.prompt([{                          // product name
        name: "product_name",
        type: "input",
        message: "Enter the product's name: ",
        validate: function(value) {
            if (value.length === 0) {
                return false;
            }
            return true;
        }
    },{                                         // department name
        name: "department_name",
        type:"input",
        message: "Enter the department's name: ",
        validate: function(value) {
            if (value.length === 0) {
                return false;
            }
            return true;
        }
    },{                                         // product price
        name: "price",
        type:"number",
        message: "Enter the unit price: ",
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
    },{
        name: "stock_quantity",                 // product inventory
        type:"number",
        message: "Quantity of new product?",
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
        }
    },]).then(function(answer) {
        const query = "INSERT INTO products SET ?";
        connection.query(query, {
            product_name: answer.product_name, 
            department_name: answer.department_name.toUpperCase(), 
            price: answer.price, 
            stock_quantity: answer.stock_quantity},
            function(err, res) {
                if (err) throw err;
                console.log("\nNew product successfully added\n");
                readProducts();
            })
    })
}

/******************************************************************************
 * Run the application
 *****************************************************************************/
mainMenu();

