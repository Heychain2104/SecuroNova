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

    try {

        // Intercambiar el código por un access token
        const tokenResponse = await fetch(
            'https://discord.com/api/oauth2/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: REDIRECT_URI
                })
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error(tokenData);

            return res.status(400).send(
                '❌ Discord rechazó la autorización.'
            );
        }

        // Obtener información del usuario
        const userResponse = await fetch(
            'https://discord.com/api/users/@me',
            {
                headers: {
                    Authorization: `Bearer ${tokenData.access_token}`
                }
            }
        );

        const user = await userResponse.json();

        console.log(
            `👤 Usuario autenticado: ${user.username}`
        );

        res.send(
            `✅ ¡Bienvenido a SecuroNova, ${user.username}!`
        );

    } catch (error) {

        console.error(error);

        res.status(500).send(
            '❌ Error interno durante la autenticación.'
        );
    }
});


module.exports = app;
