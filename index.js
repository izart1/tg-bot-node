const dotenv = require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = process.env.SECRET_KEY;
const webAppUrl = 'https://earnest-nasturtium-cbc3b1.netlify.app';
const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Нажмите на кнопку', {
            reply_markup: {
                keyboard: [
                    [{text: 'Отправить данные', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        });

        await bot.sendMessage(chatId, 'Нажмите на кнопку 2', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                ]
            }
        });
    }
    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);

            await bot.sendMessage(chatId, 'Спасибо!');
            await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Дождитесь ответа! Ваш запрос обработаем в течении 10 минут.');
            }, 3000);
        } catch (e) {
            console.log(e);
        }
    }
});
app.post('/web-data', async (req, res) => {
    const {queryId, products, totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: 'Поздравляю с покупкой! Сумма:' + totalPrice
            }
        });
        return res.status(200).json({});
    } catch (e) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: ' Не удалось совершить покупку',
            input_message_content: {
                message_text: ' Не удалось совершить покупку'
            }
        });
        return res.status(500).json({});
    }
});

const PORT = 8000;
app.listen(PORT, () => console.log('server started on PORT: ' + PORT));