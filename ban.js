const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bir üyeyi sunucudan banlar.')
    .addUserOption(option =>
      option.setName('hedef')
        .setDescription('Banlanacak kullanıcı')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sebep')
        .setDescription('Ban sebebi')
        .setRequired(false)),

  async execute(interaction) {
    const hedef = interaction.options.getUser('hedef');
    const sebep = interaction.options.getString('sebep') || 'Sebep belirtilmedi.';
    const uye = await interaction.guild.members.fetch(hedef.id).catch(() => null);

    if (!uye) return interaction.reply('Kullanıcı bulunamadı veya sunucuda değil.');
    if (!uye.bannable) return interaction.reply('Bu kişiyi banlayamıyorum.');

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
      await uye.ban({ reason: sebep });
      interaction.reply(`${hedef.tag} banlandı.`);
    } else if (kullananMod) {
      if (hedefMod || hedefYonetici) {
        return interaction.reply('Kendinle aynı veya daha yüksek yetkili birini banlayamazsın.');
      } else {
        await uye.ban({ reason: sebep });
        interaction.reply(`${hedef.tag} banlandı.`);
      }
    } else {
      return interaction.reply('Bu komutu kullanmak için yetkin yok.');
    }

    const logKanal = interaction.guild.channels.cache.get(process.env.LOG_KANAL_ID);
    if (logKanal) {
      logKanal.send(`🔨 **${hedef.tag}** sunucudan banlandı. Sebep: ${sebep}`);
    }
  }
};
