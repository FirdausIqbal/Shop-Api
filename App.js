import express, { json } from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import {db} from './models/db.js'
import User from './routes/user.js'
import Auth from './routes/auth.js'
import Products from './routes/product.js'
import Cart from './routes/cart.js'
import Orders from './routes/order.js'



const app = express();
const port = 3000;

dotenv.config();
db.connect();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use("/api/user", User);
app.use("/api/auth", Auth);
app.use("/api/products", Products);
app.use("/api/cart", Cart);
app.use("/api/order", Orders);


app.listen(port, ()=> console.log(`App Running On port ${port} ...`))