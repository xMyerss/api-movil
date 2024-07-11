import { pool } from '../DB/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import upload from '../libs/multer.config.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';


const secretKey = process.env.JWT_SECRET || 'josafat';

const up = upload.single('image');

export const getUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const createUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { nombreCompleto, correo, contrasena } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasena, salt);

        const [rows] = await pool.query(
            "INSERT INTO users (nombreCompleto, correo, contrasena) VALUES (?, ?, ?)",
            [nombreCompleto, correo, hashedPassword]
        );

        if (rows.affectedRows > 0) {
            res.status(201).json({ message: "Usuario registrado" });
        } else {
            res.status(400).json({ message: "No se pudo registrar el usuario" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const updateUser = (req, res) => {
    up(req, res, async (err) => {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        if (err instanceof multer.MulterError) {
            return res.status(500).json({ message: "Algo ocurrió mal..." });
        } else if (err) {
            console.log(err);
            return res.status(500).json({ message: err });
        }

        try {
            const { nombreCompleto, correo, contrasena } = req.body;
            const { id } = req.params;
            let imgUrl;

            if (req.file) {
                imgUrl = `${process.env.API_HOST}/public/${req.file.filename}`;
            }

            let query = "UPDATE users SET ";
            const params = [];

            if (nombreCompleto) {
                query += "nombreCompleto = ?, ";
                params.push(nombreCompleto);
            }

            if (correo) {
                query += "correo = ?, ";
                params.push(correo);
            }

            if (contrasena) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(contrasena, salt);
                query += "contrasena = ?, ";
                params.push(hashedPassword);
            }

            if (imgUrl) {
                query += "image = ?, ";
                params.push(imgUrl);
            }

            query = query.slice(0, -2);  // Remover la última coma y espacio
            query += " WHERE id = ?";
            params.push(id);

            const [result] = await pool.query(query, params);

            if (result.affectedRows > 0) {
                res.status(200).json({ message: "Usuario actualizado" });
            } else {
                if (req.file) {
                    fs.unlink(`./storage/imgs/${req.file.filename}`, (err) => {
                        if (err) console.error('Error al eliminar el archivo:', err);
                    });
                }
                res.status(404).json({ message: "Usuario no encontrado" });
            }
        } catch (error) {
            if (req.file) {
                fs.unlink(`./storage/imgs/${req.file.filename}`, (err) => {
                    if (err) console.error('Error al eliminar el archivo:', err);
                });
            }
            console.error(error);
            return res.status(500).json({ message: 'Error en el servidor' });
        }
    });
};


export const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { correo, contrasena } = req.body;

        // Verificar si el usuario existe
        const [rows] = await pool.query("SELECT * FROM users WHERE correo = ?", [correo]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }

        const user = rows[0];

        // Verificar la contraseña
        const validPassword = await bcrypt.compare(contrasena, user.contrasena);
        if (!validPassword) {
            return res.status(401).json({ message: "Correo o contraseña incorrectos" });
        }

        // Generar el token
        const token = jwt.sign({ id: user.id, correo: user.correo }, secretKey, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};


export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};


export const getUserByEmail = async (req, res) => {
    try {
        const { correo } = req.params;
        const [rows] = await pool.query('SELECT * FROM users WHERE correo = ?', [correo]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        res.status(200).json({ message: 'Usuario eliminado' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};