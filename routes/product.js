import express from 'express';
import { db } from '../models/db.js';
import { verifyAdmin, verifyAndAuth } from './verifyToken.js';

const router = express.Router();

//Function untuk mengolah data sebelum di buat query
const dataValidation = (data)=>{
    if(data.price){data.price = parseInt(data.price)}
    if(data.quantity){data.quantity = parseInt(data.quantity)}
    if(data.category){data.category = data.category.split(",")}
    return data;
}

const stringData = (data)=>{
    const getKey = Object.entries(data).map(([key])=> key);
    const getValue = Object.entries(data).map(([_, value])=> value);
    const getIndex = Object.entries(data).map((_, id)=> `$${id+1}`);
    const stringKey = getKey.join(",");
    const indexString = getIndex.join(",");
    return {getValue, stringKey, indexString};
}
//end Function

// Buat Get All Product
router.get("/all", async (req,res)=>{
    try {
        const result = await db.query(`SELECT * FROM products`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message);
    }
})


// Create Products
router.post("/", verifyAdmin,async(req,res)=>{
    try{
        // Validasi input
        // if(req.body.category){req.body.category = req.body.category.split(",")}
        // if(req.body.price){req.body.price = parseInt(req.body.price)}
       
        // Memecah input menjadi partial untuk query
        // const getkeyReq = Object.entries(req.body).map(([key])=> key);
        // const getvalueReq = Object.entries(req.body).map(([_, value])=> value);

        // menjadikan value dan key menjadi string untuk query
        // const keyString = getkeyReq.join(", ");
        //membuat angka berdasarkan data dari req.body agar responsive pada query
        // const valueCode = Object.entries(req.body).map((_, id)=> `$${id+1}`) ;
        // const valueString = valueCode.join(",")
        // console.log(keyString, getvalueReq, valueString);

        const fixData = dataValidation(req.body);
        const {getValue, stringKey, indexString} = stringData(fixData)
        //Query data ke database
        const result = await db.query(`INSERT INTO products (${stringKey}) VALUES (${indexString}) RETURNING *`, getValue);
        res.status(200).json(result.rows)
    }catch(err){
        res.status(500).json(err.message)
    }
})


//Update products
router.put("/:id", verifyAdmin, async(req,res)=>{
    try {
        const data = dataValidation(req.body);
        const stringData = Object.entries(data).map(([key, value])=> key==='category' ? `${key} = '{${value}}'` : `${key} = '${value}'`);
        const fixData = stringData.join(",")
        console.log(fixData)
        const result = await db.query(`UPDATE products SET ${fixData} WHERE id = $1 RETURNING *`, [req.params.id])
        res.status(200).json(result.rows)
    } catch (error) {
        console.log(error.message)
        res.status(500).json(error.message)
    }
});

//Delete products
router.delete("/:id", verifyAdmin, async (req,res)=>{
    try {
        const result = await db.query(`DELETE FROM products WHERE id = $1 RETURNING *`, [req.params.id]);
        res.status(200).json({status : "berhasil menghapus data", ...result.rows[0]})
    } catch (error) {
        console.log(error.message)
        res.status(500).json(`Internal Error : ${error.message}`)
    }
})



export default router;