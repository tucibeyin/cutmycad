export default function Header() {
    return `
        <header style="background: #333; color: white; padding: 1rem;">
            <nav style="display: flex; justify-content: space-between;">
                <div class="brand">CutMyCad</div>
                <div class="menu">
                    <a href="#/" style="color:white; margin-right:10px">Ana Sayfa</a>
                    <a href="#/login" style="color:white; margin-right:10px">Giriş</a>
                    <a href="#/dashboard" style="color:white;">Panel</a>
                </div>
            </nav>
        </header>
    `;
}