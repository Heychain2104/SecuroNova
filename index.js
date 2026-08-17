require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

const crypto = require('crypto');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.once('ready', () => {
    console.log(`✅ SecuroNova conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

    // ==========================================
    // BOTONES
    // ==========================================

    if (interaction.isButton()) {

        // ==========================================
        // BOTÓN "VERIFICARSE"
        // ==========================================

        if (interaction.customId === 'verify_user') {

            try {

                await interaction.reply({
                    content: '📩 Se te va a enviar un mensaje privado para continuar con la verificación.',
                    ephemeral: true
                });

                // Embed del MD
                const verificationDM = new EmbedBuilder()
                    .setColor('#3498DB')
                    .setDescription(
                        `El servidor **${interaction.guild.name}** está protegido por **SecuroNova**, ` +
                        `por favor, se ruega que se verifique pulsando el enlace de abajo.\n\n` +
                        `Se enviará un MD automáticamente una vez que se haya finalizado la verificación.`
                    )
                    .setFooter({
                        text: 'Powered by SecuroNova'
                    });

                // Botón para iniciar la verificación
                const verifyDMButton = new ButtonBuilder()
                    .setCustomId('start_verification')
                    .setLabel('Iniciar verificación')
                    .setEmoji('🔐')
                    .setStyle(ButtonStyle.Primary);

                const verifyDMRow = new ActionRowBuilder()
                    .addComponents(verifyDMButton);

                // Enviar MD
                await interaction.user.send({
                    embeds: [verificationDM],
                    components: [verifyDMRow]
                });

                console.log(
                    `📩 MD de verificación enviado a ${interaction.user.tag}`
                );

            } catch (error) {

                console.error(error);

                if (!interaction.replied) {

                    await interaction.reply({
                        content: '❌ No puedo enviarte un mensaje privado. Comprueba que tienes los MD habilitados para este servidor.',
                        ephemeral: true
                    });

                } else {

                    await interaction.followUp({
                        content: '❌ No puedo enviarte un mensaje privado. Comprueba que tienes los MD habilitados para este servidor.',
                        ephemeral: true
                    });

                }
            }

            return;
        }

        // ==========================================
        // BOTÓN "INICIAR VERIFICACIÓN"
        // ==========================================

        if (interaction.customId === 'start_verification') {

            try {

                // Generar identificador único
                const verificationToken = crypto
                    .randomBytes(32)
                    .toString('hex');

                // Enlace temporal
                const verificationUrl =
                    `https://securonova.verification/${verificationToken}`;

                // Confirmación
                await interaction.reply({
                    content: '🔐 Tu solicitud de verificación ha sido recibida.',
                    ephemeral: true
                });

                // Embed de verificación
                const verificationEmbed = new EmbedBuilder()
                    .setColor('#8000FF')
                    .setDescription(
                        'Para continuar con la verificación, pulsa el botón de abajo.'
                    )
                    .setFooter({
                        text: 'Powered by SecuroNova'
                    });

                // Botón del enlace
                const verificationButton = new ButtonBuilder()
                    .setLabel('Verificarme')
                    .setEmoji('🔐')
                    .setStyle(ButtonStyle.Link)
                    .setURL(verificationUrl);

                const verificationRow = new ActionRowBuilder()
                    .addComponents(verificationButton);

                // Enviar enlace por MD
                await interaction.user.send({
                    embeds: [verificationEmbed],
                    components: [verificationRow]
                });

                console.log(
                    `🔗 Enlace generado para ${interaction.user.tag}: ${verificationToken}`
                );

            } catch (error) {

                console.error(error);

                if (interaction.replied) {

                    await interaction.followUp({
                        content: '❌ No se pudo generar el enlace de verificación.',
                        ephemeral: true
                    });

                } else {

                    await interaction.reply({
                        content: '❌ No se pudo generar el enlace de verificación.',
                        ephemeral: true
                    });

                }
            }

            return;
        }
    }

    // ==========================================
    // COMANDOS SLASH
    // ==========================================

    if (!interaction.isChatInputCommand()) return;

    const command = require(`./commands/${interaction.commandName}.js`);

    try {

        await command.execute(interaction);

    } catch (error) {

        console.error(error);

        if (interaction.replied || interaction.deferred) {

            await interaction.followUp({
                content: '❌ Ha ocurrido un error al ejecutar este comando.',
                ephemeral: true
            });

        } else {

            await interaction.reply({
                content: '❌ Ha ocurrido un error al ejecutar este comando.',
                ephemeral: true
            });

        }
    }
});

client.login(process.env.DISCORD_TOKEN);