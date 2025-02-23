import { db } from "@/app/query/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
    try {
        const { username, password } = await req.json();
        if (!username || !password) {
            return Response.json({ error: "Faltan datos" }, { status: 400 });
        }

        const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
        const user = stmt.get(username);

        if (!user) {
            return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return Response.json({ error: "Contraseña incorrecta" }, { status: 401 });
        }

        // Generar token JWT
        const token = jwt.sign({ userId: user.id, username: user.username }, "secreto_super_seguro", { expiresIn: "1h" });

        return Response.json({ token, message: "Inicio de sesión exitoso" });
    } catch (error) {
        return Response.json({ error: "Error al iniciar sesión" }, { status: 500 });
    }
}
