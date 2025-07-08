const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [];
const komutKlasoru = path.join(__dirname, 'komutlar');
const komutDosyalari = fs.readdirSync(komutKlasoru).filter(file => file.endsWith('.js'));

for (const file of komutDosyalari) {
    const komut = require(`./komutlar/${file}`);
    commands.push(komut.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Slash komutları yükleniyor...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log('Slash komutlar başarıyla yüklendi.');
    } catch (error) {
        console.error(error);
    }
})();
