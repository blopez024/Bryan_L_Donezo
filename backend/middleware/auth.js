// Import the `jsonwebtoken` module for verifying and creating JWTs
import jwt from 'jsonwebtoken';

// Middleware function to verify the JSON Web Token (JWT)
const verifyToken = (req, res, next) => {
    // Extract the token from the Authorization header (if it exists)
    const token = req.headers.authorization?.split(' ')[1];

    // If not token is provided, respond with 401 Unauthorized status
    if (!token) {
        res.status(401).json({
            success: false,
            message: "Unauthorized Status"
        });
    }

    try {
        // Verify the token using the secret stored in the environment variable
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded token payload (user information) to the request object
        req.user = decoded;

        // Proceed to the next middleware or route handler
        next();
    } catch (e) {
        console.log(e);

        // If token verification fails, respond with a 401 Unauthorized Status
        res.status(401).json({
            success: false,
            message: "Invalid Token"
        });
    }
}

export default verifyToken;