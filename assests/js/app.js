import Header from './components/Header.js';
// import Footer from './components/Footer.js'; // İstersen ekle
import { router } from './router.js';

const root = document.getElementById('root');

function render() {
    root.innerHTML = `
        <div class="app-container">
            ${Header()}
            <main id="main-content">
                ${router()}
            </main>
            </div>
    `;
}

// URL değişince (Hash change) yeniden render et
window.addEventListener('hashchange', render);

// İlk açılışta render et
window.addEventListener('load', render);