import express from 'express';
import { db } from '../models/db.js';
import { verifyAdmin, verifyAndAuth } from './verifyToken.js';

const router = express.Router();


//get tester join db contoh JOIN 3 table dari carts>user | product_cart>carts | product_cart>product || dengan kunci nilai carts.id
router.get("/find/:id", verifyAndAuth, async (req, res)=>{
    try {
        const test = await db.query(`
        SELECT u.username nama_cust, p.prod_name, pc.quantity * p.price AS total_harga
        FROM carts c
        JOIN users u ON u.id = c.userid 
        JOIN product_cart pc ON pc.cart_id = c.id
        JOIN products p ON pc.product_id = p.id
        WHERE u.id = $1
        `, [req.params.id]);
        res.json(test.rows);
    } catch (error) {
        console.log(error.message)
    }
});

// GET All User Cart
router.get("/all", verifyAdmin, async (req, res)=>{
    try {
        const result = await db.query(`
        SELECT carts.id, users.username FROM carts
        JOIN users ON users.id = carts.userid
        `) // *NOTICE* SELALU PERHATIKAN RELASI KEY AGAR DATA TIDAK AMBIGU contoh: users.id = carts.userid |ini relasi foreign key
        res.status(200).json(result.rows)
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message)
    }
});

//function mengambil nilai string dari req untuk digunakan ke query
const setString = (data)=>{
    if(data.quantity){data.quantity = parseInt(data.quantity)};
    const stringData = Object.entries(data).map(([key, value])=> `${key}='${value}'`);
    const result = stringData.join(",");
    return result;
}
//end function

//UPDATE CART
router.put("/:id", verifyAndAuth, async (req,res)=>{
    try {
        const sD = setString(req.body);
        console.log(sD)
        const result = await db.query(`
        UPDATE product_cart SET ${sD} WHERE id=$1 RETURNING *
        `, [req.params.id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
    }
})

//function validation data req.
const valid = (data)=>{
    if(data.cart_id){
        data.cart_id = parseInt(data.cart_id)
    };
    if(data.product_id){
        data.product_id = parseInt(data.product_id)
    };
    if(data.quantity){
        data.quantity = parseInt(data.quantity)
    };
    return data;
}
//end function

//ADD TO CART
router.post("/", verifyAndAuth, async (req,res)=>{
    try {
        const valiData = valid(req.body)
        const getValue = Object.entries(valiData).map(([_, value])=> value);
        const getKey = Object.entries(valiData).map(([key])=> key);
        const index = Object.entries(valiData).map((_, id)=> `$${id+1}`);
        const setKey = getKey.join(",")
        const setIndex = index.join(",")
        console.log(getValue, setKey, setIndex);
        const result = await db.query(`INSERT INTO product_cart (${setKey}) VALUES (${setIndex}) RETURNING *`, getValue);
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
    }
})

//DELETE CART
router.delete("/:id", verifyAndAuth, async (req,res)=>{
    try {
        const result = await db.query(`DELETE FROM product_cart WHERE id = $1 RETURNING id`, [req.params.id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message)
    }
})



export default router;
