const Discord = require('discord.js');
exports.run = async (client, message, args) => {
     
  message.delete();
  const msg = await message.channel.send('Unlocking...');  
  try {
  
    client.channels.get('485680288123584525').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('468759629334183956').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('511430482710495232').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('508006539768889354').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506970598631538708').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506970616029773825').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506955507051921408').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506955269423628288').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506955565843480598').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506970804668465183').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506962968517541888').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506962932924678144').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506962951014580234').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506962899592413205').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('506970839439245313').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('491066378728767488').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('488762614156099585').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
    client.channels.get('489234703229124608').overwritePermissions('446067825673633794', {
      SEND_MESSAGES: true
    });
  } catch (err) {
    msg.edit(err);
  }
  
  msg.edit('✅ ***Successfully unlocked the server.***');

  const embed = new Discord.RichEmbed();
  embed.setTitle('UNLOCKED SERVER');
  embed.addField('Unlocked by', message.member.user.tag, true);
  try {
    embed.addField('Reason', args.join(' '));
  } catch (err) {
    embed.addField('Reason', err, true);
  }
  embed.setColor('GREEN');
  embed.setFooter(client.user.username, client.user.avatarURL);
  embed.setTimestamp();
  
  client.channels.get('510616115144163333').send(embed);
  
};
  
exports.conf = {
  enabled: true,
  aliases: [],
};
      
exports.help = {
  name: 'unlockdown',
  category: 'System',
  description: 'Unlocks down the server.',
  usage: 'unlockdown'
};