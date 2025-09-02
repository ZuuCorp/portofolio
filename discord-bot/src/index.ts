import 'dotenv/config';
import { Client, GatewayIntentBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel, CategoryChannel } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
const targetGuildId = process.env.GUILD_ID;

if (!token) {
  console.error('Missing DISCORD_TOKEN in environment.');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Slash commands definition
const commands = [
  {
    name: 'setup',
    description: "Crée une catégorie et des salons avec des 'containers' d'interface bot",
    options: [
      {
        name: 'categorie',
        description: 'Nom de la catégorie à créer',
        type: 3,
        required: true
      },
      {
        name: 'interfaces',
        description: "Liste d'interfaces séparées par des virgules",
        type: 3,
        required: true
      }
    ]
  },
  {
    name: 'addimage',
    description: 'Ajoute une image au salon courant (URL)',
    options: [
      {
        name: 'url',
        description: "URL de l'image à afficher",
        type: 3,
        required: true
      },
      {
        name: 'titre',
        description: "Titre de l'image",
        type: 3,
        required: false
      }
    ]
  }
];

client.once('ready', async () => {
  console.log(`Connecté en tant que ${client.user?.tag}`);
  try {
    if (targetGuildId) {
      const guild = await client.guilds.fetch(targetGuildId);
      await guild.commands.set(commands);
      console.log(`Commandes slash enregistrées pour ${guild.name} (${guild.id}).`);
    } else {
      const guilds = await client.guilds.fetch();
      for (const [guildId] of guilds) {
        const guild = await client.guilds.fetch(guildId);
        await guild.commands.set(commands);
      }
      console.log('Commandes slash enregistrées pour tous les serveurs où le bot est présent.');
    }
  } catch (error) {
    console.error('Erreur enregistrement des commandes:', error);
  }
});

function buildInterfaceEmbed(interfaceName: string) {
  const embed = new EmbedBuilder()
    .setTitle(`Interface: ${interfaceName}`)
    .setDescription("Container d'interface (components v2)")
    .setColor(0x2F3136);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('upload_image')
      .setLabel('Ajouter une image')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('refresh')
      .setLabel('Rafraîchir')
      .setStyle(ButtonStyle.Secondary)
  );

  return { embed, components: [row] };
}

async function createCategoryIfNotExists(guildId: string, categoryName: string): Promise<CategoryChannel> {
  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();
  const existing = channels.find((c) => c && c.type === ChannelType.GuildCategory && c.name === categoryName) as CategoryChannel | undefined;
  if (existing) return existing;
  const category = await guild.channels.create({ name: categoryName, type: ChannelType.GuildCategory });
  return category;
}

async function createTextChannelUnderCategory(guildId: string, category: CategoryChannel, name: string): Promise<TextChannel> {
  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.create({
    name,
    type: ChannelType.GuildText,
    parent: category.id
  });
  return channel as TextChannel;
}

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'setup') {
      const categoryName = interaction.options.getString('categorie', true);
      const interfacesCsv = interaction.options.getString('interfaces', true);
      const interfaceNames = interfacesCsv
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await interaction.reply({ content: 'Configuration en cours...', ephemeral: true });

      try {
        const category = await createCategoryIfNotExists(interaction.guildId!, categoryName);

        for (const interfaceName of interfaceNames) {
          const channelName = interfaceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const channel = await createTextChannelUnderCategory(interaction.guildId!, category, channelName);
          const { embed, components } = buildInterfaceEmbed(interfaceName);
          await channel.send({ embeds: [embed], components });
        }

        await interaction.followUp({ content: 'Setup terminé ✅', ephemeral: true });
      } catch (error) {
        console.error(error);
        await interaction.followUp({ content: "Erreur pendant le setup.", ephemeral: true });
      }
    }

    if (interaction.commandName === 'addimage') {
      const url = interaction.options.getString('url', true);
      const title = interaction.options.getString('titre') ?? 'Image';

      const embed = new EmbedBuilder().setTitle(title).setImage(url).setColor(0x5865F2);
      await interaction.reply({ embeds: [embed] });
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === 'upload_image') {
      await interaction.reply({ content: "Envoie l'URL de ton image juste après ce message.", ephemeral: true });
    }
    if (interaction.customId === 'refresh') {
      await interaction.reply({ content: 'Rafraîchi ✅', ephemeral: true });
    }
  }
});

client.login(token);

