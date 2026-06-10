import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Reconfiguración de __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, 'data', 'mascotas.json');

// Middlewares
app.use(express.json());
app.use(express.static('public')); // Sirve el frontend funcional

// Funciones auxiliares para leer y escribir el archivo JSON
async function leerMascotas() {
    try {
        const data = await fs.readFile(DATA_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Si el archivo no existe, retornamos un arreglo vacío
        return [];
    }
}

async function guardarMascotas(mascotas) {
    await fs.writeFile(DATA_PATH, JSON.stringify(mascotas, null, 2), 'utf-8');
}

// ==========================================
// RUTAS GET
// ==========================================
app.get('/mascotas', async (req, res) => {
    try {
        const { nombre, rut } = req.query;
        const mascotas = await leerMascotas();

        // GET con parámetro nombre: /mascotas?nombre=Pelusa
        if (nombre) {
            const mascota = mascotas.find(m => m.nombre.toLowerCase() === nombre.toLowerCase());
            if (!mascota) return res.status(404).json({ error: 'Mascota no encontrada' });
            return res.json(mascota);
        }

        // GET con parámetro rut: /mascotas?rut=12345678-9
        if (rut) {
            const filtradas = mascotas.filter(m => m.rut.replace(/\s+/g, '') === rut.replace(/\s+/g, ''));
            return res.json(filtradas);
        }

        // GET sin parámetros: Retorna todo
        res.json(mascotas);
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor al leer los datos.' });
    }
});

// ==========================================
// RUTA POST
// ==========================================
app.post('/mascotas', async (req, res) => {
    try {
        const { nombre, rut } = req.body;

        if (!nombre || !rut) {
            return res.status(400).json({ error: 'El nombre de la mascota y el RUT del dueño son obligatorios.' });
        }

        const mascotas = await leerMascotas();
        
        // Validación: evitar duplicar exactamente la misma mascota para el mismo dueño
        const existe = mascotas.some(m => m.nombre.toLowerCase() === nombre.toLowerCase() && m.rut === rut);
        if (existe) {
            return res.status(400).json({ error: 'Esta mascota ya está registrada para este dueño.' });
        }

        const nuevaMascota = { nombre, rut };
        mascotas.push(nuevaMascota);
        await guardarMascotas(mascotas);

        res.status(201).json({ mensaje: 'Mascota registrada exitosamente en el Registro Civil', mascota: nuevaMascota });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor al guardar la mascota.' });
    }
});

// ==========================================
// RUTAS DELETE
// ==========================================
app.delete('/mascotas', async (req, res) => {
    try {
        const { nombre, rut } = req.query;
        let mascotas = await leerMascotas();
        const totalInicial = mascotas.length;

        if (!nombre && !rut) {
            return res.status(400).json({ error: 'Debe especificar el parámetro "nombre" o "rut" para eliminar.' });
        }

        // DELETE por nombre
        if (nombre) {
            mascotas = mascotas.filter(m => m.nombre.toLowerCase() !== nombre.toLowerCase());
        } 
        // DELETE por rut
        else if (rut) {
            mascotas = mascotas.filter(m => m.rut.replace(/\s+/g, '') !== rut.replace(/\s+/g, ''));
        }

        if (mascotas.length === totalInicial) {
            return res.status(404).json({ error: 'No se encontraron registros que coincidan con la búsqueda para eliminar.' });
        }

        await guardarMascotas(mascotas);
        res.json({ mensaje: `Eliminación exitosa. Se removieron ${totalInicial - mascotas.length} registro(s).` });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor al eliminar.' });
    }
});

// Inicializar Servidor
app.listen(PORT, () => {
    console.log(`🇨🇱 Servidor del Ministerio de las Mascotas (ES Modules) corriendo en http://localhost:${PORT}`);
});