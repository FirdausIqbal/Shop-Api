import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next)=>{
    const header = req.headers.authorization;
    if(header){
        const token = header.split(' ')[1];
        jwt.verify(token, process.env.JWT_KEY, (err, user)=>{
            if(err){return res.status(403).json("Token is not valid")};
            req.user = user;
            next();
        })
    }else{
        return res.status(500).json("Token Is Not Authenticated")
    };
};

export const verifyAndAuth = (req,res,next)=>{
    verifyToken(req,res, ()=>{
        if(req.user.id === parseInt(req.params.id) || req.user.isAdmin){
            next();
        }else{
            res.status(403).json("You're not allowed")
        }
    })
}
export const verifyAdmin = (req,res,next)=>{
    verifyToken(req,res, ()=>{
        if(req.user.isAdmin){
            next();
        }else{
            res.status(403).json("You're not allowed")
        }
    })
}