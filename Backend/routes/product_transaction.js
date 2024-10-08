const express = require("express");
const db = require("../db");
const router = express.Router();
const axios = require('axios');



// Fetch and seed data
router.get('/', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const products = response.data;

        // Iterate through the products and insert into MySQL
        products.forEach((product) => {
            const { id, title, price, description, category, image, sold, dateOfSale } = product;

            const query = `
                INSERT INTO products (id, title, price, description, category, image, sold, dateOfSale) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                title = VALUES(title),
                price = VALUES(price),
                description = VALUES(description),
                category = VALUES(category),
                image = VALUES(image),
                sold = VALUES(sold),
                dateOfSale = VALUES(dateOfSale)
            `;

            db.query(query, [id, title, price, description, category, image, sold, new Date(dateOfSale)], (err, result) => {
                if (err) {
                    console.error('Error inserting data: ', err);
                    return;
                }
                console.log('Inserted/Updated product ID:', id);
            });
        });

        res.status(200).send('Database initialized with seed data!');
    } catch (error) {
        console.error('Error fetching data from API:', error);
        res.status(500).send('Error initializing database');
    }
});


router.get('/transactions', (req, res) => {
    let { search = '', month, page = 1, perPage = 10 } = req.query;
    page = parseInt(page);
    perPage = parseInt(perPage);

    // Validate the month input
    if (!month) {
        return res.status(400).json({ error: 'Month is required' });
    }

    // Calculate the offset for pagination
    const offset = (page - 1) * perPage;

    // Base query for transactions with pagination
    let query = `SELECT * FROM products WHERE MONTH(dateOfSale) = ?`;

    // Add search filters if search parameter is provided
    if (search) {
        query += ` AND (title LIKE ? OR description LIKE ? OR price LIKE ?)`;
        search = `%${search}%`; // Wildcard search
    }

    // Append pagination to the query
    query += ` LIMIT ?, ?`;

    // Build the query parameters
    const params = search ? [month, search, search, search, offset, perPage] : [month, offset, perPage];

    // Execute the query
    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching data: ', err);
            return res.status(500).send('Error fetching transactions');
        }

        // Fetch the total count for pagination
        let countQuery = `SELECT COUNT(*) AS total FROM products WHERE MONTH(dateOfSale) = ?`;
        if (search) {
            countQuery += ` AND (title LIKE ? OR description LIKE ? OR price LIKE ?)`;
        }

        const countParams = search ? [month, search, search, search] : [month];
        db.query(countQuery, countParams, (err, countResult) => {
            if (err) {
                console.error('Error fetching count: ', err);
                return res.status(500).send('Error fetching count');
            }

            const total = countResult[0].total;
            const totalPages = Math.ceil(total / perPage);

            // Return the results with pagination metadata
            res.json({
                page,
                perPage,
                total,
                totalPages,
                data: results
            });
        });
    });
});


router.get('/statistics', (req, res) => {
    const { month } = req.query; // Expecting month as a query parameter

    // Validate the input
    if (!month) {
        return res.status(400).json({ error: 'Month is required' });
    }

    // SQL query to get the statistics
    const query = `
        SELECT
            SUM(price) AS totalSaleAmount,
            SUM(CASE WHEN sold = true THEN 1 ELSE 0 END) AS totalSoldItems,
            SUM(CASE WHEN sold = false THEN 1 ELSE 0 END) AS totalNotSoldItems
        FROM products
        WHERE MONTH(dateOfSale) = ?
    `;

    db.query(query, [month], (err, results) => {
        if (err) {
            console.error('Error fetching statistics: ', err);
            return res.status(500).send('Error fetching statistics');
        }

        // If no results found
        if (results.length === 0) {
            return res.status(404).send('No statistics found for the selected month');
        }

        const { totalSaleAmount, totalSoldItems, totalNotSoldItems } = results[0];

        res.json({
            totalSaleAmount: totalSaleAmount || 0,
            totalSoldItems: totalSoldItems || 0,
            totalNotSoldItems: totalNotSoldItems || 0
        });
    });
});

router.get('/bar-chart', (req, res) => {
    const { month } = req.query; // Expecting month as a query parameter

    // Validate the input
    if (!month) {
        return res.status(400).json({ error: 'Month is required' });
    }

    // SQL query to get the count of items in specified price ranges for the selected month
    const query = `
        SELECT
            CASE
                WHEN price BETWEEN 0 AND 100 THEN '0 - 100'
                WHEN price BETWEEN 101 AND 200 THEN '101 - 200'
                WHEN price BETWEEN 201 AND 300 THEN '201 - 300'
                WHEN price BETWEEN 301 AND 400 THEN '301 - 400'
                WHEN price BETWEEN 401 AND 500 THEN '401 - 500'
                WHEN price BETWEEN 501 AND 600 THEN '501 - 600'
                WHEN price BETWEEN 601 AND 700 THEN '601 - 700'
                WHEN price BETWEEN 701 AND 800 THEN '701 - 800'
                WHEN price BETWEEN 801 AND 900 THEN '801 - 900'
                ELSE '901 - above'
            END AS price_range,
            COUNT(*) AS item_count
        FROM products
        WHERE MONTH(dateOfSale) = ?
        GROUP BY price_range
        ORDER BY MIN(price)
    `;

    db.query(query, [month], (err, results) => {
        if (err) {
            console.error('Error fetching bar chart data: ', err);
            return res.status(500).send('Error fetching bar chart data');
        }

        // If no results found
        if (results.length === 0) {
            return res.status(404).send('No data found for the selected month');
        }

        res.json(results);
    });
});

router.get('/pie-chart', (req, res) => {
    const { month } = req.query; // Expecting month as a query parameter

    // Validate the input
    if (!month) {
        return res.status(400).json({ error: 'Month is required' });
    }

    // SQL query to get unique categories and the count of items in each category for the selected month
    const query = `
        SELECT category, COUNT(*) AS item_count
        FROM products
        WHERE MONTH(dateOfSale) = ?
        GROUP BY category
    `;

    db.query(query, [month], (err, results) => {
        if (err) {
            console.error('Error fetching pie chart data: ', err);
            return res.status(500).send('Error fetching pie chart data');
        }

        // If no results found
        if (results.length === 0) {
            return res.status(404).send('No data found for the selected month');
        }

        res.json(results);
    });
});





module.exports = router;