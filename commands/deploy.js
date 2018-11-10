const { exec } = require('child_process');

exports.run = async (client, msg, message) => {
  if (!message.author.id === '278620217221971968') return;
  const command = 'git pull';
  //args.join(' ');
  const outMessage = await msg.channel.send('`Deploying...`');
  //await msg.channel.send(`Running \`${command}\`...`);
  let stdOut = await doExec(command).catch(data=> outputErr(outMessage, data));
  stdOut = stdOut.substring(0, 1750);
  outMessage.edit(`\`DEPLOYMENT STATUS\`
\`\`\`sh
${stdOut}
\`\`\``);
};

exports.conf = {
  enabled: true,
  aliases: [],
};

exports.help = {
  name: 'deploy',
  category: 'System',
  description: 'Deploys recent changes on the repository.',
  usage: 'deploy'
};

const outputErr = (msg, stdData) => {
  const { stdout, stderr } = stdData;
  const message = stdout.concat(`\`\`\`${stderr}\`\`\``);
  msg.edit(message);
};

const doExec = (cmd, opts = {}) => {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      if (err) return reject({ stdout, stderr });
      resolve(stdout);
    });
  });
};