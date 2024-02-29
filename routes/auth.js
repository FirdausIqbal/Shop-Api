import express from 'express';
import { db } from '../models/db.js';
import CryptoJS from 'crypto-js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post("/register", async(req,res)=>{
    try{
        const {username, password, email} = req.body;
        const data = await db.query(`INSERT INTO users (username, password, email) 
        VALUES ($1, $2, $3) RETURNING *`, [username, CryptoJS.AES.encrypt(password, process.env.AES_KEY).toString(), email]);
        res.status(200).json(data.rows)
    }catch(err){
        console.log(err.message);
        res.status(500).json(err.message)
    }
})


router.post("/login", async(req,res)=>{
    try{
        const data = await db.query(`SELECT * FROM users WHERE username=$1`, [req.body.username]);
        //Check if username is exist
        if(data.rows.length === 0){ 
            return res.json("Wrong Credentials")
        };

        //Decrypt password;
        const decryptPw = CryptoJS.AES.decrypt(data.rows[0].password, process.env.AES_KEY).toString(CryptoJS.enc.Utf8);
        //Check if password is wrong
        if(decryptPw !== req.body.password){return res.json("Wrong Credentialss")};

        //Destruct data from database particaly
        const {password, ...newdata} = data.rows[0];
        //Create Token From JSONWEBTOKEN
        const token = jwt.sign({
            id: data.rows[0].id,
            isAdmin: data.rows[0].isadmin}, process.env.JWT_KEY,{expiresIn: "1h"}
        )

        res.status(200).json({...newdata, token})
    }catch(err){
        console.log(err.message);
        res.status(500).json(err.message)
    }
})

export default router;