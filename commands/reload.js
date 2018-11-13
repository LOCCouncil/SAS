exports.run = async (client, message, args) => {
  if (!args || args.length < 1) return message.reply('please provide a package to reload.');
  
    let response = await client.unloadCommand(args[0]); //eslint-disable-line
  if (response) return message.reply(`Error Unloading: ${response}`);
  
  response = client.loadCommand(args[0]);
  if (response) return message.reply(`Error Loading: ${response}`);
  
  message.reply(`the package \`${args[0]}\` has been reloaded.`);
};
  
exports.conf = {
  enabled: true,
  aliases: ['r'],
};
  
exports.help = {
  name: 'reload',
  category: 'System',
  description: 'Reloads a command that\'s been modified.',
  usage: 'reload [command]'
};

