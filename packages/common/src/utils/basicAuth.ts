import {NextFunction, Request, Response} from 'express';


export const basicAuth = (systemCredentials: {password: string, username: string}, enabled = true) => (req: Request, res: Response, next: NextFunction) => {
    if(!enabled) {
        next();
        return;
    }

    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        res.status(401).send('Unauthorized: No Authorization header provided');
        return;
    }

    if (!authHeader.startsWith('Basic ')) {
        return res.status(401).send('Invalid authorization header.');
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = Buffer.from(token, 'base64').toString();

    const [username, password] = decodedToken.split(':');

    if (username === systemCredentials.username && password === systemCredentials.password) {
        next();
    } else {
        res.status(401).send('Unauthorized: Invalid credentials');
    }
};