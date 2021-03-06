const Discord = require('discord.js');
exports.run = async (client, message, args) => {
  const msg = await message.channel.send('Locking...');

  //const thisChannel = client.channels.get(args[0]);
  const resolvedChannel = (args[0] !== undefined) ? client.channels.get(args[0].match(/[0-9]/g).join('')) : null;
  const thisChannel0 = resolvedChannel ? message.guild.members.get(resolvedChannel.id) : null;

  const thisChannel = thisChannel0;
  try {
    thisChannel.overwritePermissions(thisChannel, {
      SEND_MESSAGES: false
    });
  } catch (err) {
    msg.edit(`An error has occurred during this process. | ${err}`);
  }

  const embed = new Discord.RichEmbed();
  embed.setTitle('CHANNEL LOCK');
  embed.addField('Channel Name', thisChannel.name, true);
  embed.addField('Locked by', message.member.user.tag, true);
  try {
    embed.addField('Reason', args.splice(1).join(' '), true);
  } catch (err) {
    embed.addField('Reason', err, true);
  }
  embed.setColor('ORANGE');
  embed.setFooter(client.user.username, client.user.avatarURL);
  embed.setTimestamp();

  client.channels.get('510616115144163333').send(embed);

  msg.edit(`✅ ***Successfully locked #${thisChannel.name}***`);
  message.delete();
};

exports.conf = {
  enabled: true,
  aliases: [],
};
      
exports.help = {
  name: 'lock',
  category: 'System',
  description: 'Locks down a specified channel.',
  usage: 'lock [channel ID] [reason]'
};
