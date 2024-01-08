const {config} = require('dotenv');
config();

const { Bot } = require("grammy");
const Calendar = require('telegram-inline-calendar');

const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
process.env.NTBA_FIX_319 = 1;

function getRestDays(startDate, endDate) {
    let restDays = [];
    let currentDayInSchedule = 0; // 0 - день работы, 1 - ночь работы, 2 и 3 - дни отдыха

    while (startDate < endDate) {
        if (currentDayInSchedule === 0 || currentDayInSchedule === 1) {
            let formattedDate = startDate.getFullYear() + '-' +
                                String(startDate.getMonth() + 1).padStart(2, '0') + '-' +
                                String(startDate.getDate()).padStart(2, '0');
            restDays.push(formattedDate);
        }
        startDate.setDate(startDate.getDate() + 1);
        currentDayInSchedule = (currentDayInSchedule + 1) % 4; // переходим к следующему дню в графике работы
    }

    return restDays;
}

let startDate = new Date('2023-12-31');
let endDate = new Date('2029-01-01');

const bot = new Bot(TOKEN);
const calendar = new Calendar(bot, {
    date_format: 'DD-MM-YYYY',
    language: 'ru',
    bot_api: 'grammy',
    start_week_day: 1,
    lock_date: true
});

calendar.lock_date_array = getRestDays(startDate, endDate)

bot.command('start', ctx => {
  ctx.reply('Привет! Здесь ты можешь посмотреть выходные дни Марины Станиславовны');
  calendar.startNavCalendar(ctx.msg);
})

bot.on("callback_query:data", async (ctx) => {
    if (ctx.msg.message_id === calendar.chats.get(ctx.chat.id)) {
        calendar.clickButtonCalendar(ctx.callbackQuery);
    }
});

bot.start();