/******************************************************************************
 * This script implements the Customer View node application.
 * A MySql database of products for sale will be displayed. The user is then 
 * prompted for which of the items they would like to purchase, followed by
 * how many of the items they would like to purchase. If the database has 
 * sufficient inventory the order will be executed.
 *****************************************************************************/
const mysql = require("mysql");                 // dependencies
const inquirer = require("inquirer");
const Table = require('cli-table');

const makePurchase = "Make a purchase";         // menu selections
const exitApp = "Exit"; 
const orderDetails = " Order Details ";         // display variables
const sepWidth = 80;

/******************************************************************************
 * Create the database connection, and connect to the database.
 *****************************************************************************/
const connection = mysql.createConnection({     // mySql connection
    host: "localhost",
    port: 3306,
    user: "root",
    password: "del0r1sX",
    database: "bamazon"
});

connection.connect(function(err) {              // connect to db
    if (err) throw err;
});

/******************************************************************************
 * Read the database and display items as a table
 *****************************************************************************/
function readProducts() {
    const query =                               // create query
        "SELECT item_id, " +
        "IFNULL(product_name,'n/a') AS name, " +
        "IFNULL(department_name,'n/a') AS dept, " +
        "IFNULL(price,'0') AS cost, " +
        "IFNULL(stock_quantity,'0') AS amount " +
        "FROM products";
    connection.query(query, function(err, res) {
        if (err) throw err;
        let table = new Table({                 //npm cli table
            head: ["ID", "Product", 'Department', "Price $", "Quantity"], 
            colWidths: [5, 30, 20, 10, 7]
        });
        for(let i = 0; i < res.length; i++){    //push each item into the table  
            table.push([res[i].item_id, res[i].name, res[i].dept, 
              res[i].cost, res[i].amount]);
        }
        console.log(`\n${table.toString()}\n`);
        purchase();
    });
}

/******************************************************************************
 * User makes a purchase
 *****************************************************************************/
function purchase(){
    inquirer.prompt([{
        name: "idSelect",
        type: "number",
        message: "Select an item to purchase by ID",
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
    }},{
        name: "quantity",
        type:"number",
        message: "How many would you like to purchase",
        validate: function(value) {
            if (isNaN(value) === false) {
                return true;
            }
            return false;
          }
    }])
    .then(function(answer) {
        const query = 
            "SELECT item_id, " +
            "product_name, " +
            "price, " +
            "stock_quantity " +
            "FROM products " +
            "WHERE item_id = ?";    
        connection.query(query, answer.idSelect, function(err, res) {
            if (err) throw err;
            else if (!res.length) {
                console.log(`\n${'_'.repeat(sepWidth)}\n`);
                console.log("\n!NO ITEM SELECETED\n CHECK ITEM ID NUMBER!\n");
                readProducts()
            }
            else if (answer.quantity > res[0].stock_quantity){
                console.log(`\n${'_'.repeat(sepWidth)}\n`);
                console.log("\n!INSUFFICIENT QUANTITY\n CHECK ORDER AMOUNT!\n");
                readProducts()
            }
            else {                              // update product inventory
                const update = 
                    "UPDATE products " +
                    "SET stock_quantity = stock_quantity - ? " +
                    "WHERE item_id = ?";
                connection.query(
                  update, [answer.quantity, answer.idSelect], 
                      function(err, res) {
                          if (err) throw err;
                })
                const update2 =                 // update product sales
                    "UPDATE products " +
                    "SET product_sales = product_Sales + price * ? " +
                    "WHERE item_id = ?"
                connection.query(update2, [answer.quantity, answer.idSelect], function(err, res) {
                    if (err) throw err;
                })

                const query2 = 
                    "SELECT item_id, product_name, price, stock_quantity " +
                    "FROM products WHERE item_id = ?";    
                connection.query(query2, answer.idSelect, function(err, res) {
                    if (err) throw err;
                    let total = res[0].price * answer.quantity;
                    let table = new Table({
                        head: ["Product", "Quantity", "Price"], 
                        colWidths: [25,25,20]
                    });
                    table.push(
                       [res[0].product_name, answer.quantity, "$" + total.toFixed(2)]
                    );
                    let prefix = "_".repeat(Math.floor((sepWidth - orderDetails.length)/2));
                    let suffix = "_".repeat(sepWidth - orderDetails.length - prefix.length);
                    console.log(`\n${prefix}${orderDetails}${suffix}\n`);
                    console.log(table.toString());
                    console.log(`\n${'_'.repeat(sepWidth)}\n`);
                    getCustInput();
                });
            }
        });
    });
} 

/******************************************************************************
 * Display user menu
 *****************************************************************************/
function getCustInput(){
    inquirer.prompt({                           // display menu
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [makePurchase, exitApp]
    })
    .then(function(answer) {                    // process user input
        switch (answer.action) {
            case makePurchase:                  // make a purchase
                readProducts();
                break;
            case  exitApp:                      // exit the app
                connection.end();
                break;
        }
    });
}

/******************************************************************************
 * Run the application
 *****************************************************************************/
getCustInput();                                 // Get first user input