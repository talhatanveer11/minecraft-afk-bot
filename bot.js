const mineflayer = require('mineflayer');

const botNames = ['talhapro1098', 'talha1099', 'talha2099', 'talha3099', 'talha4099'];
const bots = [];
let botJoinDelay = 0;
const messageCounts = {};
const activeBots = {};

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createBot(username) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bot = mineflayer.createBot({
                host: 'play.applemc.fun',
                port: 25565,
                username: username,
                version: '1.20.1',
                auth: 'offline',
            });

            messageCounts[username] = 0;
            activeBots[username] = false;

            bot.on('login', () => console.log(`✅ ${username} logged in!`));

            bot.on('spawn', async () => {
                console.log(`🎮 ${username} spawned in! Waiting before moving...`);
                await delay(3000);
                openRealmSelector(bot);
                resolve(bot);  // Resolve when the bot is spawned and ready to go
            });

            bot.on('message', async (message) => {
                const msg = message.toString();
                if (activeBots[username]) {
                    messageCounts[username]++;
                    printMessageCounts();
                }

                if (msg.includes('/register')) {
                    console.log(`📝 ${username} detected registration! Sending /register likese11 likese11`);
                    await delay(2000);
                    bot.chat('/register likese11 likese11');
                } else if (msg.includes('/login')) {
                    console.log(`🔑 ${username} detected login! Sending /login likese11`);
                    await delay(2000);
                    bot.chat('/login likese11');
                }
            });

            bot.on('kicked', (reason) => {
                console.log(`❌ ${username} was kicked: ${reason}`);
                console.log(`⏳ Reconnecting ${username} in 30s...`);
                setTimeout(() => createBot(username), 30000);
            });

            bot.on('error', (err) => {
                console.log(`❌ ${username} Connection error:`, err);
                reject(err);  // Reject on error
            });

            bot.on('end', () => {
                console.log(`🔄 ${username} disconnected. Reconnecting in 30s...`);
                setTimeout(() => createBot(username), 30000);
            });

            bots.push(bot);
        }, botJoinDelay);
        botJoinDelay += 5000; // 5 second delay between each bot
    });
}

async function openRealmSelector(bot) {
    await delay(3000);
    bot.setQuickBarSlot(4);
    console.log(`🖐 ${bot.username} holding compass in hand.`);
    await delay(2000);
    bot.clearControlStates();
    await delay(1000);
    bot.activateItem();
    await delay(5000);

    let attempts = 3;
    while (!bot.currentWindow && attempts > 0) {
        console.log(`❌ ${bot.username} No inventory window open! Retrying... (${attempts} attempts left)`);
        await delay(2000);
        bot.activateItem();
        await delay(5000);
        attempts--;
    }

    if (!bot.currentWindow) {
        console.log(`❌ ${bot.username} Realm selector did not open.`);
        return;
    }

    console.log(`📜 ${bot.username} Realm selector menu opened: ${bot.currentWindow.title}`);
    let realmDye = bot.currentWindow.slots.find(item => item && item.name.includes('yellow_dye'));

    if (!realmDye) {
        console.log(`❌ ${bot.username} Yellow dye not found!`);
        return;
    }

    let clickAttempts = 3;
    while (clickAttempts > 0) {
        console.log(`🖱 ${bot.username} Clicking yellow dye to enter realm... (Attempt ${4 - clickAttempts}/3)`);
        await bot.clickWindow(realmDye.slot, 0, 0);
        await delay(2000);
        if (!bot.currentWindow) {
            console.log(`✅ ${bot.username} Successfully entered realm!`);
            break;
        }
        clickAttempts--;
    }

    if (clickAttempts === 0) {
        console.log(`❌ ${bot.username} Failed to click yellow dye!`);
        return;
    }

    await delay(3000);
    bot.chat('/warp afk');
    console.log(`🚀 ${bot.username} executed /warp afk.`);

    // Activate message counting after bot is ready
    activeBots[bot.username] = true;
    printMessageCounts();
}

function printMessageCounts() {
    console.clear();
    console.log('📩 Active Bots & Message Counts:');
    Object.keys(activeBots).forEach(name => {
        if (activeBots[name]) {
            console.log(`➡️ ${name}: Messages [${messageCounts[name]}]`);
        } else {
            console.log(`❌ ${name}: Not joined yet.`);
        }
    });
}

async function startBots() {
    for (const name of botNames) {
        try {
            await createBot(name);  // Wait for each bot to join and spawn before continuing
        } catch (error) {
            console.error(`Failed to start bot ${name}:`, error);
        }
    }
}

startBots();
