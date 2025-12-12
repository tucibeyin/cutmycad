import { AuthService } from "../services/AuthService.js";

export default function Dashboard() {
    if (!AuthService.isAuthenticated()) {
        window.location.hash = "/login";
        return "";
    }

    return `
        <section>
            <h1>Yönetim Paneli</h1>
            <p>Gizli alana hoş geldiniz.</p>
            <button onclick="localStorage.removeItem('user_token'); window.location.hash='/login'">Çıkış Yap</button>
        </section>
    `;
}