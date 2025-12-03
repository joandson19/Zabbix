#!/usr/bin/node

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

(async () => {
    if (process.argv.length < 3) {
        console.log(JSON.stringify({
            status: "error",
            message: "Uso incorreto. Exemplo: node downdetector.js whatsapp"
        }));
        process.exit(1);
    }

    const service = process.argv[2];
    const url = `https://downdetector.com/status/${service}/`;

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-breakpad',
            '--disable-sync',
            '--mute-audio'
        ]
    });

    try {
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132 Safari/537.36'
        );

        await page.setExtraHTTPHeaders({
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
        });

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        let content = await page.evaluate(() =>
            document.body.innerText.toLowerCase()
        );

        // Normaliza texto
        let txt = content.replace(/\s+/g, ' ').trim();

        let status = "unknown";
        let message = "";
        let raw = "";

        // 🔹 Sem problemas — texto do site internacional
        if (txt.includes("no current problems") || txt.includes("no problems at")) {
            status = "1";
            message = "Não há problemas detectados";
            raw = `OK: Não há problemas detectados no serviço '${service}'`;
        }

        // 🔹 Problemas detectados
        else if (/problems? at/.test(txt) || /possible problems/.test(txt)) {
            status = "0";
            message = "Potenciais problemas detectados";
            raw = `ALERTA: Problemas detectados no serviço '${service}'`;
        }

        // 🔹 Cloudflare/Proteções
        else if (txt.includes("cloudflare") || txt.includes("verify you are human")) {
            status = "3";
            message = "Bloqueado pelo Cloudflare (mesmo com stealth)";
            raw = txt.substring(0, 200);
        }

        // 🔹 Fallback
        else {
            status = "4";
            message = "Não foi possível determinar o status";
            raw = `ERRO: Não foi possível determinar o status do serviço '${service}'`;
        }

        console.log(JSON.stringify({ service, status, message, raw }));

    } catch (error) {
        console.log(JSON.stringify({
            service: service,
            status: "error",
            message: "Erro ao processar",
            raw: error.message
        }));
    } finally {
        await browser.close();
    }
})();
