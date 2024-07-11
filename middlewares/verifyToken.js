import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'josafat';

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "Token no proporcionado" });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        console.log('Token decodificado:', decoded); // log para depuración
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.error('Error de verificación del token:', error); // log para depuración
        return res.status(401).json({ message: "Token no válido" });
    }
};

export default verifyToken;
