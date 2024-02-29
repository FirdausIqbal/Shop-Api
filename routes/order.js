import express from 'express';
import { db } from '../models/db.js';
import { verifyAdmin, verifyAndAuth } from './verifyToken.js';

const router = express.Router();

//GET SPECIFIC ORDER;
router.get("/find/:id", verifyAndAuth, async (req,res)=>{
    try {
        const result = await db.query(`
        SELECT u.username, 
        o.id, 
        SUM(pc.quantity) AS jumlah_order, 
        STRING_AGG(p.prod_name, ', ') AS products,
        SUM(p.price * pc.quantity) AS total,
        o.status, 
        o.time_order
        FROM orders o
        JOIN carts c ON o.cart_id = c.id
        JOIN users u ON u.id = c.userid
        JOIN product_cart pc ON pc.cart_id = c.id
        JOIN products p ON p.id = pc.product_id
        WHERE o.id = $1
        GROUP BY u.username, o.id, o.status, o.time_order;
        `, [req.params.id]);
        res.status(200).json(result.rows)
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
    }
})

//GET ALL ORDER
router.get("/all", verifyAdmin, async (req,res)=>{
    try {
        const result = await db.query(`
        SELECT
        u.username, 
        STRING_AGG(p.prod_name, ', ') AS products,
        SUM(p.price * pc.quantity) AS total,
        o.status,
        o.time_order
        FROM orders o
        JOIN carts c ON o.cart_id = c.id
        JOIN users u ON c.userid = u.id
        JOIN product_cart pc ON pc.cart_id = c.id
        JOIN products p ON pc.product_id = p.id
        GROUP BY u.username, o.status, o.time_order
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
    }
});

//POST ORDER
router.post("/:cartid", verifyAndAuth, async(req,res)=>{
    try {
        const result = await db.query(`INSERT INTO orders (cart_id) VALUES ($1) RETURNING *`, [req.params.cartid]);
        res.status(200).json(result.rows)
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
    }
});

//DELETE ORDER
router.delete("/:id", verifyAdmin, async (req,res)=>{
    try {
        const result = await db.query(`DELETE FROM orders WHERE id=$1 RETURNING *`, [req.params.id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
    }
})

export default router;