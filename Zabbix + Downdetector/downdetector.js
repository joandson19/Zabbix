#!/usr/bin/node

const puppeteer = require('puppeteer-core');

(async () => {
    if (process.argv.length < 3) {
        console.log(JSON.stringify({
            status: "error",
            message: "Uso incorreto. Exemplo: node downdetector.js whatsapp"
        }));
        process.exit(1);
    }

    const service = process.argv[2];
    const url = `https://downdetector.com.br/fora-do-ar/${service}/`;

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium',
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-gpu',
				'--single-process',
				'--no-zygote',
				'--disable-background-networking',
				'--disable-background-timer-throttling',
				'--disable-breakpad',
				'--disable-default-apps',
				'--disable-extensions',
				'--disable-sync',
				'--metrics-recording-only',
				'--mute-audio'
			]

    });

    try {
        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132 Safari/537.36'
        );

        await page.goto(url, { waitUntil: 'networkidle2' });

        const content = await page.evaluate(() =>
            document.body.innerText.toLowerCase()
        );

        let status = "error";
        let message = "";
        let raw = "";

        if (content.includes("não há problemas atuais")) {
            status = "ok";
            message = "Não há problemas detectados";
            raw = `OK: Não há problemas detectados no serviço '${service}'`;
        } else if (content.includes("potenciais problemas com")) {
            status = "alert";
            message = "Potenciais problemas detectados";
            raw = `ALERTA: Problemas detectados no serviço '${service}'`;
        } else {
            status = "unknown";
            message = "Não foi possível determinar o status";
            raw = `ERRO: Não foi possível determinar o status do serviço '${service}'`;
        }

        console.log(JSON.stringify({
            service: service,
            status: status,
            message: message,
            raw: raw
        }));

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
