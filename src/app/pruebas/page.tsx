import { checkModels } from "@/app/api/bot/check-models";

export default function Page() {
    return (
        <div>
            <h1>Pruebas</h1>
            <p>Este es un componente de prueba.</p>
            <pre>{JSON.stringify(checkModels(), null, 2)}</pre>
        </div>
    );
}