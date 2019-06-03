DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    item_id SMALLINT AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(40) NOT NULL,
    department_name VARCHAR(20) NOT NULL,
    price DECIMAL(9,2) NOT NULL DEFAULT 0.0,
    stock_quantity SMALLINT(9) NOT NULL DEFAULT 0,
    product_sales DECIMAL(9,2) NOT NULL DEFAULT 0,
    primary key(item_id)
);

select * from products;

INSERT INTO products(product_name,department_name,price,stock_quantity)
VALUES ('Portable Air Compressor','AUTOMOTIVE',34.87,50),
    ('Mechanics Tool Set','AUTOMOTIVE',32.99,140),
    ('New Balance Walking Shoe','CLOTHING',24.64,42),
    ('Wrangler Relaxed Fit Jeans','CLOTHING',29.98,23),
    ('Acer 15 inch Laptop','ELECTRONICS',299.99,13),
    ('HP 21 inch Monitor','ELECTRONICS',89.99,22),
    ('Black & Decker Drill','TOOLS',55.26,25),
    ('Tekton Hex Key Wrench','TOOLS',15.20,27),
    ('Blizzard','SOFTWARE',20.00,35),
    ('Microsoft Office Home','SOFTWARE',109.00,23);

CREATE TABLE departments(
    department_id SMALLINT AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(40) NOT NULL,
    over_head_costs DECIMAL(9,2) NOT NULL DEFAULT 0.0,
    PRIMARY KEY(department_id));

INSERT INTO departments(department_name, over_head_costs)
VALUES ('AUTOMOTIVE', 1500.00),
    ('CLOTHING', 2000.00),
    ('ELECTRONICS', 3000.00),
    ('TOOLS', 3000.00),
    ('SOFTWARE', 1200.00),
    ('KIDS', 4000.00),
    ('SPORTS', 1200.00);