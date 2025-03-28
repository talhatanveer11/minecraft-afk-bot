const mineflayer = require('mineflayer');

const botNames = ['talhapro1098', 'talha1099', 'talha2099', 'talha3099', 'talha4099'];
const bots = [];
let botJoinDelay = 0;
const messageCounts = {};
const activeBots = {};

function createBot(username) {
    setTimeout(() => {
        const bot = mineflayer.createBot({
            host: 'play.applemc.fun',
            port: 25565,
            username: username,
            version: '1.20.1',
            auth: 'offline'
        });

        messageCounts[username] = 0;
        activeBots[username] = false;

        bot.on('login', () => console.log(`✅ ${username} logged in!`));

        bot.on('spawn', async () => {
            console.log(`🎮 ${username} spawned. Waiting before moving...`);
            await delay(3000);
            openRealmSelector(bot);
        });

        bot.on('message', async (message) => {
            const msg = message.toString();
            if (activeBots[username]) {
                messageCounts[username]++;
                printMessageCounts();
            }

            if (msg.includes('/register')) {
                console.log(`📝 ${username} detected registration! Sending /register`);
                await delay(2000);
                bot.chat('/register likese11 likese11');
            } else if (msg.includes('/login')) {
                console.log(`🔑 ${username} detected login! Sending /login`);
                await delay(2000);
                bot.chat('/login likese11');
            }
        });

        bot.on('kicked', (reason) => {
            console.log(`❌ ${username} was kicked: ${reason}`);
            reconnect(username);
        });

        bot.on('error', (err) => {
            console.log(`❌ ${username} Error:`, err.message);
        });

        bot.on('end', () => {
            console.log(`🔄 ${username} disconnected. Reconnecting...`);
            reconnect(username);
        });

        bots.push(bot);
    }, botJoinDelay);
    botJoinDelay += 5000;
}

function reconnect(username) {
    setTimeout(() => createBot(username), 30000);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

async function openRealmSelector(bot) {
    await delay(3000);
    try {
        bot.setQuickBarSlot(4);
        console.log(`🖐 ${bot.username} holding compass.`);
        await delay(2000);
        bot.clearControlStates();
        await delay(1000);
        bot.activateItem();
        await delay(4000);

        let attempts = 10;
        while (!bot.currentWindow && attempts > 0) {
            console.log(`⚠️ ${bot.username} Menu not open. Retrying... (${10 - attempts + 1}/10)`);
            bot.activateItem();
            await delay(4000);
            attempts--;
        }

        if (!bot.currentWindow) {
            console.log(`❌ ${bot.username} Realm selector failed. Restarting bot...`);
            bot.quit();
            return;
        }

        console.log(`📜 ${bot.username} Realm selector opened: ${bot.currentWindow.title}`);
        let realmDye = bot.currentWindow.slots.find(item => item && item.name.includes('yellow_dye'));

        if (!realmDye) {
            console.log(`❌ ${bot.username} Yellow dye not found. Restarting bot...`);
            bot.quit();
            return;
        }

        let clickAttempts = 3;
        while (clickAttempts > 0) {
            console.log(`🖱 ${bot.username} Clicking yellow dye... (${4 - clickAttempts}/3)`);
            await bot.clickWindow(realmDye.slot, 0, 0);
            await delay(2000);
            if (!bot.currentWindow) {
                console.log(`✅ ${bot.username} Entered realm!`);
                break;
            }
            clickAttempts--;
        }

        if (clickAttempts === 0) {
            console.log(`❌ ${bot.username} Failed to click dye. Restarting bot...`);
            bot.quit();
            return;
        }

        await delay(3000);
        bot.chat('/warp afk');
        console.log(`🚀 ${bot.username} executed /warp afk.`);

        activeBots[bot.username] = true;
        printMessageCounts();
    } catch (err) {
        console.log(`❌ ${bot.username} Error in realm selector: ${err.message}`);
        bot.quit();
    }
}

botNames.forEach(name => createBot(name));
