import express from 'express';
import {db} from '../models/db.js'
import { verifyAdmin, verifyAndAuth } from './verifyToken.js';

const router = express.Router();

//Update User data
router.put("/:id", verifyAndAuth,async (req,res)=>{
    try {
        const data = Object.entries(req.body).map(([key, value])=>  `${key} = '${value}'`);
        const newData = data.join(", ")
        console.log(newData)
        const result = await db.query(`UPDATE users SET ${newData} WHERE id=$1 RETURNING *`, [req.params.id]);
        res.status(200).json(result.rows)
    } catch (error) {
        res.status(500).json(error.message)
    }
})

//Delete User
router.delete("/:id", verifyAdmin, async (req, res)=>{
    try{
        const data = await db.query(`DELETE FROM users WHERE id=$1 RETURNING *`, [req.params.id]);
        const {password, ...result} = data.rows[0];
        res.status(200).json({pesan:"Berhasil Menghapus Data", ...result})
    }catch(err){
        res.status(500).json(err.message)
    }
});


//find User
router.get("/find/:id", verifyAdmin, async (req, res)=>{
    try{
        const data = await db.query(`SELECT * FROM users WHERE id=$1`, [req.params.id]);
        if(data.rows.length === 0){return res.status(404).json("cannot find the correct id")}
        const {password, ...result} = data.rows[0];
        res.status(200).json(result)
    }catch(err){
        res.status(500).json(err.message)
    }
})

//find all User
router.get("/all", verifyAdmin, async (req, res)=>{
    const query = req.query.new;
    try{
        const data = query ? await db.query(`SELECT * FROM users ORDER BY id ASC LIMIT ${query}`) : await db.query(`SELECT * FROM users`);
        const newData = data.rows.map(({password, ...result})=> result);
        res.status(200).json(newData)
    }catch(err){
        res.status(500).json(err.message)
    }
})

//User Stats
router.get("/stats", verifyAdmin, async (req,res)=>{
    try {
        const dateFromDb = await db.query(`SELECT createdat FROM users`);
        const lastyear = new Date().getFullYear()-1; //buat nilai setahun sebelum saat ini
        const yearFiltered = dateFromDb.rows.filter(year=> year.createdat.getFullYear() > lastyear); //filter tahun yang tidak lebih kecil dari tahun terakhir
        const statsLastYear = yearFiltered.reduce((acumulator, current)=>{ //membuat objek dari setiap nilai date menggunakan reduce()
            const _id = current.createdat.getMonth()+1;
            acumulator[_id] ? acumulator[_id].total += 1 : acumulator[_id] = {_id, total:1};
            return acumulator;
        }, {});
        const result = Object.values(statsLastYear) //membuat object dari hasil reduce() | menyatukan object menjadi satu array
        res.status(200).json(result);
    } catch (error) {
        res.status(404).json(error.message)
    }
})

export default router;