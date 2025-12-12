import Header from './components/Header.js';
import Footer from './components/Footer.js'; // <-- EKLENDİ
import { router } from './router.js';

const app = document.getElementById('app');

const render = async () => {
    const pageContent = await router();

    app.innerHTML = `
        <div class="flex flex-col min-h-screen bg-gray-50 font-sans text-gray-900">
            
            ${Header()}

            <main class="flex-grow">
                ${pageContent}
            </main>

            ${Footer()}
            
        </div>
    `;
};

window.addEventListener('hashchange', render);
window.addEventListener('load', render);