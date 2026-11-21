const mineflayer = require('mineflayer');

// ===== CONFIGURAÇÃO =====
const HOST = 'deathsmp-5f5fea.play.shulkerboxes.com';
const PORT = 25565; // Era 67676, que é inválido (o máximo é 65535)
const USERNAME = 'Bandido_quer_67';
const SENHA = 'erickJKN';
const ATRASO_LOGIN_MS = 4000;

// ===== MENSAGENS DO CHAT (troque aqui) =====
const MENSAGENS_PERIODICAS = [
    'Macumba Preta Do Cario',
    'ADM ABUSER DE MERDA DÃO TUDO O CU FILHOS DA PUTA',
    'ADM TUDO COM 5cm DE ROLA DURA AINDA OTÁRIOS DE MERDA'
];
const INTERVALO_MENSAGENS_MS = 5 * 60 * 1000; // 5 minutos

// ===== ESTADO =====
let bot = null;
let rotinasIniciadas = false;
let indiceMensagem = 0;

function iniciarRotinas() {
    // Mensagens periódicas
    setInterval(() => {
        if (!bot || !bot.entity) return;
        bot.chat(MENSAGENS_PERIODICAS[indiceMensagem]);
        indiceMensagem = (indiceMensagem + 1) % MENSAGENS_PERIODICAS.length;
    }, INTERVALO_MENSAGENS_MS);

    // Rotina anti-AFK: buscar cofre, interagir, cerrar y saltar (cada 45 segundos)
    setInterval(async () => {
        if (!bot || !bot.entity) return;

        try {
            const chestBlock = bot.findBlock({
                matching: bot.registry.blocksByName.chest.id,
                maxDistance: 5
            });

            if (chestBlock) {
                console.log('[NPC] Interactuando con el contenedor cercano...');
                const chest = await bot.openChest(chestBlock);
                console.log('[NPC] Contenedor abierto.');

                await new Promise(resolve => setTimeout(resolve, 2000));

                chest.close();
                console.log('[NPC] Contenedor cerrado.');
            } else {
                console.log('[NPC] Aviso: No se detectó ningún contenedor válido cerca.');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
            console.log('[NPC] Acción anti-inactividad completada con éxito.');

        } catch (err) {
            console.log(`[NPC] Error en el ciclo de ejecución: ${err.message}`);
        }
    }, 45000);
}

function createBot() {
    bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: USERNAME,
        version: false // Autodetecta la versión (1.8 a 1.21+)
    });

    bot.on('spawn', () => {
        console.log('[NPC] El bot ha aparecido correctamente en el mapa.');

        // Login para servidores no premium
        setTimeout(() => bot.chat(`/login ${OIOIOI} ${OIOIOI}`), ATRASO_LOGIN_MS);

        // Inicia las rutinas solo una vez, aunque el bot se reconecte
        if (!rotinasIniciadas) {
            rotinasIniciadas = true;
            iniciarRotinas();
        }
    });

    bot.on('login', () => {
        console.log('[NPC] Conexión establecida con el servidor de Minecraft.');
    });

    // Auto-reconexión tras expulsiones o reinicios del servidor
    bot.on('end', (reason) => {
        console.log(`[NPC] Conexión finalizada por: ${reason}. Reintentando en 25 segundos...`);
        setTimeout(createBot, 25000);
    });

    bot.on('error', (err) => console.log(`[NPC] Error crítico de red detectado: ${err}`));
}

createBot();
