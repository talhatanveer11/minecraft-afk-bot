const mineflayer = require('mineflayer');

const botNames = ['talhapro1098', 'talha1099', 'talha2099', 'talha3099', 'talha4099'];
const bots = [];
let botJoinDelay = 0;

function createBot(username) {
    setTimeout(() => {
        const bot = mineflayer.createBot({
            host: 'play.applemc.fun',
            port: 25565,
            username: username,
            version: '1.20.1',
            auth: 'offline'
        });

        bot.on('login', () => console.log(`✅ ${username} logged in!`));

        bot.on('spawn', async () => {
            console.log(`🎮 ${username} spawned in! Waiting before moving...`);
            await delay(3000);
            openRealmSelector(bot);
        });

        bot.on('message', async (message) => {
            const msg = message.toString();
            console.log(`💬 ${username} Server Message: ${msg}`);

            if (msg.includes('/register')) {
                console.log(`📝 ${username} detected registration prompt! Sending /register likese11 likese11`);
                await delay(2000);
                bot.chat('/register likese11 likese11');
            } else if (msg.includes('/login')) {
                console.log(`🔑 ${username} detected login prompt! Sending /login likese11`);
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
        });

        bot.on('end', () => {
            console.log(`🔄 ${username} disconnected. Reconnecting in 30s...`);
            setTimeout(() => createBot(username), 30000);
        });

        bots.push(bot);
    }, botJoinDelay);
    botJoinDelay += 5000; // Delay each bot joining by 5 seconds
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
        console.log(`❌ ${bot.username} Yellow dye not found! Listing all items:`);
        bot.currentWindow.slots.forEach((item, index) => {
            if (item) console.log(`🔍 Slot ${index}: ${item.name}`);
        });
        return;
    }

    let clickAttempts = 3;
    while (clickAttempts > 0) {
        console.log(`🖱 ${bot.username} Clicking yellow dye to enter realm... (Attempt ${4 - clickAttempts}/3)`);
        await bot.clickWindow(realmDye.slot, 0, 0);
        await delay(2000);
        if (!bot.currentWindow) {
            console.log(`✅ ${bot.username} Successfully exited realm selector menu!`);
            break;
        }
        clickAttempts--;
    }

    if (clickAttempts === 0) {
        console.log(`❌ ${bot.username} Failed to click yellow dye after multiple attempts!`);
        return;
    }

    await delay(3000);
    bot.chat('/warp afk');
    console.log(`🚀 ${bot.username} Executed /warp afk to move to AFK area.`);
}

botNames.forEach(name => createBot(name));
