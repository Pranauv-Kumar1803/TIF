import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
    const bearer = req.headers.authorization;
    if (!bearer?.startsWith('Bearer ')) return res.status(401).json({
        "status": false,
        "errors": [
            {
                "message": "You need to sign in to proceed.",
                "code": "NOT_SIGNEDIN"
            }
        ]
    });

    const token = bearer.split(' ')[1];
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.status(403).json({
                "status": false,
                "errors": [
                    {
                        "message": "Wrong token provided!",
                        "code": "WRONG_TOKEN"
                    }
                ]
            });
            req.user = decoded.user.email;
            req.user_id = decoded.user.id;
            next();
        }
    )
}

export default verifyToken;