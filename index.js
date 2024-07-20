const { BotFrameworkAdapter, MemoryStorage, UserState, ActivityHandler } = require('botbuilder');
const restify = require('restify');
require('dotenv').config();

// Create adapter.
const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Create server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`\n${server.name} listening to ${server.url}`);
});

// Define state store for your bot.
const memoryStorage = new MemoryStorage();
const userState = new UserState(memoryStorage);

// Create bot activity handler
class MyBot extends ActivityHandler {
    constructor() {
        super();
        this.userState = userState;
        this.onMessage(async (context, next) => {
            const text = context.activity.text.toLowerCase();
            if (text.includes('thời gian còn lại của năm')) {
                const now = new Date();
                const endOfYear = new Date(now.getFullYear(), 11, 31);
                const diffTime = Math.abs(endOfYear - now);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                await context.sendActivity(`Còn ${diffDays} ngày nữa là hết năm.`);
            } else if (text.includes('chúc mừng sinh nhật')) {
                await context.sendActivity('Chúc mừng sinh nhật!');
            } else if (text.includes('nhắc nhở kế hoạch')) {
                await context.sendActivity('Đừng quên kế hoạch của bạn!');
            } else {
                await context.sendActivity('Tôi không hiểu yêu cầu của bạn. Vui lòng thử lại.');
            }
            await next();
        });
    }
}

const myBot = new MyBot();

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await myBot.run(context);
    });
});
