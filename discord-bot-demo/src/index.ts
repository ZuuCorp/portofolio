import { Client, GatewayIntentBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, CategoryChannel, TextChannel } from 'discord.js';

// DEMO: hardcoded token and guild id (to be destroyed after use)
const TOKEN = 'MTM3Nzk3Nzg5MjQxNTQ3NTc1Mg.GRdwjc.3qWbwxOCgsk856SQcLuHxX9HvI7YvmKst_cUZM';
const GUILD_ID = '1412571422202794036';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [
  {
    name: 'setup',
    description: 'Crée catégorie et salons de démo, poste un container sans images',
    options: [
      {
        name: 'categorie',
        description: 'Nom de la catégorie à créer',
        type: 3,
        required: true
      },
      {
        name: 'interfaces',
        description: 'Noms des bots/interfaces séparés par des virgules',
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'demo',
    description: 'Affiche les commandes de démo (ping/help/status)'
  }
];

client.once('ready', async () => {
  console.log(`Connecté en tant que ${client.user?.tag}`);
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    await guild.commands.set(commands);
    console.log(`Commandes enregistrées pour ${guild.name}`);
  } catch (err) {
    console.error('Erreur enregistrement des commandes:', err);
  }
});

function buildDemoContainer(botName: string) {
  const embed = new EmbedBuilder()
    .setTitle(`Bot: ${botName}`)
    .setDescription('Démo interface: pas d\'images, juste des commandes de test')
    .setColor(0x5865F2);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('info').setLabel('Infos').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('cmds').setLabel('Commandes').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('try').setLabel('Essayer').setStyle(ButtonStyle.Success)
  );

  return { embed, components: [row] };
}

async function ensureCategory(guildId: string, name: string): Promise<CategoryChannel> {
  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();
  const existing = channels.find(c => c && c.type === ChannelType.GuildCategory && c.name === name) as CategoryChannel | undefined;
  if (existing) return existing;
  return await guild.channels.create({ name, type: ChannelType.GuildCategory });
}

async function createText(guildId: string, category: CategoryChannel, name: string): Promise<TextChannel> {
  const guild = await client.guilds.fetch(guildId);
  const ch = await guild.channels.create({ name, type: ChannelType.GuildText, parent: category.id });
  return ch as TextChannel;
}

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'setup') {
      const categoryName = interaction.options.getString('categorie', true);
      const list = interaction.options.getString('interfaces', true);
      const bots = list.split(',').map(s => s.trim()).filter(Boolean);

      await interaction.reply({ content: 'Setup démo en cours…', ephemeral: true });
      try {
        const cat = await ensureCategory(interaction.guildId!, categoryName);
        for (const bot of bots) {
          const chName = bot.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const ch = await createText(interaction.guildId!, cat, chName);
          const { embed, components } = buildDemoContainer(bot);
          await ch.send({ embeds: [embed], components });
        }
        await interaction.followUp({ content: 'Démo prête ✅', ephemeral: true });
      } catch (e) {
        console.error(e);
        await interaction.followUp({ content: 'Erreur setup démo.', ephemeral: true });
      }
    }
    if (interaction.commandName === 'demo') {
      await interaction.reply({ content: 'Commandes de démo: ping, help, status', ephemeral: true });
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === 'info') {
      await interaction.reply({ content: 'Ceci est un bot de démo. Pas de backend, pas d\'images.', ephemeral: true });
    }
    if (interaction.customId === 'cmds') {
      await interaction.reply({ content: 'Exemples: /demo (ping/help/status), boutons de test.', ephemeral: true });
    }
    if (interaction.customId === 'try') {
      await interaction.reply({ content: 'Ping: pong! Status: OK. Help: utilisez /setup et /demo.', ephemeral: true });
    }
  }
});

client.login(TOKEN);

