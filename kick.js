const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Bir üyeyi sunucudan atar.')
    .addUserOption(option =>
      option.setName('hedef')
        .setDescription('Atılacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Atılma sebebi')
        .setRequired(false)),

  async execute(interaction) {
    const hedef = interaction.options.getUser('hedef');
    const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi.';
    const uye = await interaction.guild.members.fetch(hedef.id).catch(() => null);

    if (!uye) return interaction.reply('Kullanıcı bulunamadı veya sunucuda değil.');
    if (!uye.kickable) return interaction.reply('Bu kişiyi atamıyorum.');

    // Rol İsimleri
    const modRol = 'Ban/Kick yetkisi';
    const orgeneralRol = 'Orgeneral';
    const maresalRol = 'Mareşal';

    const kullanan = interaction.member;
    const kullananRoller = kullanan.roles.cache;
    const hedefRoller = uye.roles.cache;

    // Yönetici Kontrolü
    const kullananYonetici = kullananRoller.some(r => [orgeneralRol, maresalRol].includes(r.name));
    const hedefYonetici = hedefRoller.some(r => [orgeneralRol, maresalRol].includes(r.name));

    const kullananMod = kullananRoller.some(r => r.name === modRol);
    const hedefMod = hedefRoller.some(r => r.name === modRol);

    // Yetki Kontrolü
    if (kullananYonetici) {
      await uye.kick(sebep);
      interaction.reply(`${hedef.tag} sunucudan atıldı.`);
    } else if (kullananMod) {
      if (hedefMod || hedefYonetici) {
        return interaction.reply('Kendinle aynı veya daha yüksek yetkili birini atamazsın.');
      } else {
        await uye.kick(sebep);
        interaction.reply(`${hedef.tag} sunucudan atıldı.`);
      }
    } else {
      return interaction.reply('Bu komutu kullanmak için yetkin yok.');
    }

    const logKanal = interaction.guild.channels.cache.get(process.env.LOG_KANAL_ID);
    if (logKanal) {
      logKanal.send(`👢 **${hedef.tag}** sunucudan atıldı. Sebep: ${sebep}`);
    }
  }
};
