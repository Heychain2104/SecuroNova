const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-verification')
        .setDescription('Configura el sistema de verificación de SecuroNova.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guild = interaction.guild;

        await interaction.deferReply({ ephemeral: true });

        // =========================
        // CREAR / BUSCAR ROL
        // =========================

        let verifiedRole = guild.roles.cache.find(
            role => role.name === 'Verificado'
        );

        if (!verifiedRole) {
            verifiedRole = await guild.roles.create({
                name: 'Verificado',
                reason: 'Rol del sistema de verificación de SecuroNova'
            });
        }

        // =========================
        // CREAR / BUSCAR CANAL
        // =========================

        let verificationChannel = guild.channels.cache.find(
            channel =>
                channel.name === 'verificacion' &&
                channel.type === ChannelType.GuildText
        );

        if (!verificationChannel) {
            verificationChannel = await guild.channels.create({
                name: 'verificacion',
                type: ChannelType.GuildText,
                reason: 'Canal del sistema de verificación de SecuroNova'
            });
        }

        // =========================
        // PERMISOS DEL CANAL
        // =========================

        await verificationChannel.permissionOverwrites.edit(
            guild.roles.everyone,
            {
                ViewChannel: true,
                SendMessages: false
            }
        );

        await verificationChannel.permissionOverwrites.edit(
            verifiedRole,
            {
                ViewChannel: false
            }
        );

        // =========================
        // EMBED DE VERIFICACIÓN
        // =========================

        const verificationEmbed = new EmbedBuilder()
            .setColor('#8000FF')
            .setDescription(
                'Acaba de entrar en un servidor protegido por **SecuroNova**, ' +
                'lo que significa que es obligatoria una verificación para identificar ' +
                'que usted no esté en lista negra.'
            )
            .setFooter({
                text: 'Powered by SecuroNova'
            });

        // =========================
        // BOTÓN DE VERIFICACIÓN
        // =========================

        const verifyButton = new ButtonBuilder()
            .setCustomId('verify_user')
            .setLabel('Verificarse')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
            .addComponents(verifyButton);

        // =========================
        // ENVIAR PANEL
        // =========================

        await verificationChannel.send({
            embeds: [verificationEmbed],
            components: [row]
        });

        // =========================
        // CONFIRMACIÓN
        // =========================

        await interaction.editReply(
            '✅ Sistema de verificación preparado.\n\n' +
            `🛡️ Rol: **${verifiedRole.name}**\n` +
            `📋 Canal: **#${verificationChannel.name}**\n` +
            '🔐 Panel de verificación enviado correctamente.'
        );
    }
};

