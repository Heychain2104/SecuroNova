const express = require('express');

const app = express();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

const REDIRECT_URI =
    'https://securo-nova.vercel.app/auth/discord/callback';


app.get('/', (req, res) => {
    res.send('SecuroNova OAuth backend online.');
});


/*
==========================================
INICIAR LOGIN CON DISCORD
==========================================
*/

app.get('/auth/discord', (req, res) => {

    const discordURL =
        'https://discord.com/oauth2/authorize' +
        `?client_id=${CLIENT_ID}` +
        '&response_type=code' +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        '&scope=identify';

    res.redirect(discordURL);
});


/*
==========================================
CALLBACK DE DISCORD
==========================================
*/

app.get('/auth/discord/callback', async (req, res) => {

    const code = req.query.code;

    if (!code) {
        return res.status(400).send(
            '❌ No se recibió ningún código de Discord.'
        );
    }

    console.log('🔐 Código OAuth recibido correctamente.');

    res.send(
        '✅ Autorización de Discord recibida. Puedes cerrar esta ventana.'
    );
});


module.exports = app;
