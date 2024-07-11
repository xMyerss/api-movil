import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import { PORT } from './config.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import userRoutes from './routes/users.routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// habilitar body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(`${__dirname}/storage/imgs`));

// Ruta Raiz
app.get('/', (req, res) => {
    res.json({ message: "Excelente!" });
});

// Routes
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
