import { AuthService } from "../services/AuthService.js";

export default function Login() {
    // Sayfa yüklendikten sonra çalışacak eventleri tanımlamak için bir yapı kuruyoruz
    setTimeout(() => {
        const btn = document.getElementById("loginBtn");
        if (btn) {
            btn.onclick = async () => {
                const user = document.getElementById("username").value;
                const pass = document.getElementById("password").value;

                const result = await AuthService.login(user, pass);
                if (result.success) {
                    window.location.hash = "/dashboard";
                } else {
                    alert(result.message);
                }
            };
        }
    }, 0);

    return `
        <section class="login-view">
            <h2>Giriş Yap</h2>
            <input type="text" id="username" placeholder="Kullanıcı: admin">
            <br><br>
            <input type="password" id="password" placeholder="Şifre: 1234">
            <br><br>
            <button id="loginBtn">Giriş</button>
        </section>
    `;
}