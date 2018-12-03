const axios = require('axios');
const publicIp = require('public-ip');
const config = require('./config.json');
const jwt = require('jsonwebtoken');
const client = require('../index.js');
async function getSelfUrl(path = '') {
  const port = 8895;
  const ip = await publicIp.v4();
  return `http://${ip}:${port}/${path}`;
}

function login(req, res) {
  getSelfUrl(config.redirectPath.slice(1)).then(redirectUri => {
    const code = req.query.code;
    const oauth2url = `https://discordapp.com/oauth2/authorize?client_id=${config.clientId}`
        + `&scope=identify&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}`;
    if (! code)
      return res.redirect(oauth2url);
    axios.post('https://discordapp.com/api/oauth2/token')
      .type('form')
      .send({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        scope: 'identify'
      }).then(response => {
        const token = jwt.sign({
          token: response.body.access_token
        }, config.clientSecret);
        res.cookie('token', token, {
          maxAge: response.body.expires_in * 1000
        });
        res.redirect('/');
      }).catch(error => { //eslint-disable-line no-unused-vars
        res.status(401);
        res.send('<pre>401 Unauthorized</pre>');
      });
  });
}
  
async function checkAuth(req, res, next) {
  if (req.cookies.token) {
    const token = req.cookies.token;
    try {
      const accessToken = jwt.verify(token, config.clientSecret).token;
      const response = await axios.get('https://discordapp.com/api/users/@me')
        .set('Authorization', `Bearer ${accessToken}`);
      req.user = response.body;
    } catch (err) {
      return res.redirect('/login');
    }
    if (! req.user) {
      return res.redirect('/login');
    } else {
      const guild = client.guilds.get(config.mailGuildId);
      const member = guild.members.get(req.user.id);
      let hasRole, isUser;
      if (config.dashAuthRoles)
        hasRole = member.roles.some(r => config.dashAuthRoles.includes(r));
      if (config.dashAuthUsers)
        isUser = config.dashAuthUsers.includes(member.id);
      if (isUser || hasRole) {
        next();
      } else {
        res.status(401);
        res.send('<pre>401 Unauthorized</pre>');
      }
    }
  } else {
    res.redirect('/login');
  }
}
  
module.exports = {
  login,
  checkAuth,
};