const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const komutKlasoru = path.join(__dirname, 'komutlar');
const komutlar = fs.readdirSync(komutKlasoru).filter(file => file.endsWith('.js'));

for (const file of komutlar) {
  const komut = require(`./komutlar/${file}`);
  client.commands.set(komut.data.name, komut);
}

const HEDEF_KANAL_ID = '1384446311302037586';

client.once('ready', () => {
  console.log(`${client.user.tag} aktif!`);
  rastgeleUyanZamanlayici();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const komut = client.commands.get(interaction.commandName);
  if (!komut) return;

  try {
    await komut.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Bir hata oluştu!', ephemeral: true });
  }
});

// 2 saatte bir kanal mesajı
function tempUyanMesaji() {
  const guild = client.guilds.cache.first();
  if (!guild) return;

  const hedefKanal = guild.channels.cache.get(HEDEF_KANAL_ID);
  if (!hedefKanal) return;

  hedefKanal.send('@everyone UYANIN!').catch(() => {});
}

function rastgeleUyanZamanlayici() {
  setInterval(() => {
    tempUyanMesaji();
  }, 2 * 60 * 60 * 1000); // 2 saatte bir
}

client.login(process.env.TOKEN);
