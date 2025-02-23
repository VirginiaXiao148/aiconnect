import { db } from "@/app/query/db";
import bcrypt from "bcrypt";

export async function POST(req) {
    try {
        const { username, email, password } = await req.json();
        if (!username || !password || email) {
            return Response.json({ error: "Faltan datos" }, { status: 400 });
        }

        // Hashear la contraseña
        const saltRounds = 10; // Número de rondas de encriptación
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        stmt.run(username,email, passwordHash);

        return Response.json({ message: "Usuario registrado" });
    } catch (error) {
        return Response.json({ error: "Error al registrar usuario" }, { status: 500 });
    }
}