const Discord = require('discord.js');

exports.run = async (client, message, args) => {
  const msg = await message.channel.send('Authorizing...');
  const resolvedUser = (args[0] !== undefined) ? message.guild.members.get(args[0].match(/[0-9]/g).join('')) : null;
  const botuser = resolvedUser ? message.guild.members.get(resolvedUser.id) : null;
  const thisUser = botuser.id;
  const thisChannel = client.channels.get('510616115144163333');

  if (!botuser.user.bot) return msg.edit('I am not permitted to run this command on human members.');
  if (!args[0]) return msg.edit('I need a client user to deny.');

  

  const embed = new Discord.RichEmbed();
  embed.setTitle('CLIENT USER DENIED');
  embed.addField('Client User Name', botuser.user.username, true);
  embed.addField('Client User Mention', `<@!${thisUser}>`, true);
  embed.addField('Client User ID', thisUser, true);
  embed.addField('Denied By', message.member.user.tag, true);
  embed.setFooter(client.user.username, client.user.username);
  embed.setTimestamp();

  thisChannel.send(embed);

  if (client.approved.get(thisUser)) {
    client.approved.delete(thisUser);
  }

  await botuser.ban({
    days: 7,
    reason: 'Client user was denied by an SAA. (softban)'
  });

  await message.guild.unban(botuser, {
    reason: 'Client user was denied by an SAA. (softban)'
  });

  msg.edit(`✅ ***${botuser.user.tag} has been denied.***`);
};

exports.conf = {
  enabled: true,
  aliases: [],
};
    
exports.help = {
  name: 'deny',
  category: 'System',
  description: 'Denies a client user.',
  usage: 'deny'
};