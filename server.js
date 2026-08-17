const cookieParser = require('cookie-parser');
const express = require('express');

const app = express();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

const REDIRECT_URI =
    'https://securo-nova.vercel.app/auth/discord/callback';


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cookieParser());


// ==========================================
// PÁGINA PRINCIPAL DEL BACKEND
// ==========================================

app.get('/', (req, res) => {
    res.send('SecuroNova OAuth backend online.');
});


// ==========================================
// INICIAR LOGIN CON DISCORD
// ==========================================

app.get('/auth/discord', (req, res) => {

    const discordURL =
        'https://discord.com/oauth2/authorize' +
        `?client_id=${CLIENT_ID}` +
        '&response_type=code' +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        '&scope=identify';

    res.redirect(discordURL);
});


// ==========================================
// CALLBACK DE DISCORD
// ==========================================

app.get('/auth/discord/callback', async (req, res) => {

    const code = req.query.code;

    // Comprobar que Discord ha enviado el código
    if (!code) {
        return res.status(400).send(
            '❌ No se recibió ningún código de Discord.'
        );
    }

    try {

        // ==========================================
        // INTERCAMBIAR CÓDIGO POR ACCESS TOKEN
        // ==========================================

        const tokenResponse = await fetch(
            'https://discord.com/api/oauth2/token',
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded'
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

        // Comprobar respuesta de Discord
        if (!tokenResponse.ok) {

            console.error(
                '❌ Error de Discord:',
                tokenData
            );

            return res.status(400).send(
                '❌ Discord rechazó la autorización.'
            );
        }


        // ==========================================
        // OBTENER INFORMACIÓN DEL USUARIO
        // ==========================================

        const userResponse = await fetch(
            'https://discord.com/api/users/@me',
            {
                headers: {
                    Authorization:
                        `Bearer ${tokenData.access_token}`
                }
            }
        );

        const user = await userResponse.json();

        // Comprobar respuesta
        if (!userResponse.ok) {

            console.error(
                '❌ No se pudo obtener el usuario:',
                user
            );

            return res.status(400).send(
                '❌ No se pudo obtener tu información de Discord.'
            );
        }


        // ==========================================
        // MOSTRAR USUARIO EN LOS LOGS
        // ==========================================

        console.log(
            `👤 Usuario autenticado: ${user.username} (${user.id})`
        );


        // ==========================================
        // CREAR DATOS DE SESIÓN
        // ==========================================

        const sessionData = JSON.stringify({
            id: user.id,
            username: user.username,
            avatar: user.avatar
        });


        // ==========================================
        // CREAR COOKIE DE SESIÓN
        // ==========================================

        res.cookie(
            'securonova_session',
            sessionData,
            {
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7
            }
        );


        // ==========================================
        // VOLVER A LA WEB DE SECURONOVA
        // ==========================================

        res.redirect(
            'https://pagina-rho-two.vercel.app'
        );

    } catch (error) {

        console.error(
            '❌ Error durante OAuth:',
            error
        );

        res.status(500).send(
            '❌ Error interno durante la autenticación.'
        );
    }
});


// ==========================================
// EXPORTAR A VERCEL
// ==========================================

module.exports = app;
