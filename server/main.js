const client = require('../index.js');
class server {
  constructor() {
    const path = require('path');
    const fs = require('fs'),
      http = require('http'),
      https = require('https'),
      express = require('express'),
      bodyParser = require('body-parser');

    const port = 443;
    const express_enforces_ssl = require('express-enforces-ssl');

    const options = {
      key: fs.readFileSync(path.join(__dirname + '/system/ssl/private.key')),
      cert: fs.readFileSync(path.join(__dirname + '/system/ssl/certificate.crt')),
      ca: fs.readFileSync(path.join(__dirname + '/system/ssl/ca_bundle.crt', ))
    };

    const app = express();

    app.enable('trust proxy');
    const rateLimit = require('express-rate-limit');
 
 
    const apiLimiter = rateLimit({
      max: 5,
      message: 'Status Code 429 | You are being ratelimited; too many requests.'
    });
 
    // only apply to requests that begin with /api/
    app.use('/api/', apiLimiter);

    app.use(express_enforces_ssl());
    app.use(bodyParser.urlencoded({ extended: true }));

    const server = https.createServer(options, app).listen(port, function() { //eslint-disable-line
      console.log('Express server listening on port ' + port);
    });
    http.createServer(function(req, res) {
      res.writeHead(301, { 'Location': 'https://' + req.headers['host'] + req.url });
      res.end();
    }).listen(80);


    app.get('/api', function(req, res) {
      res.redirect(302, 'https://sas.libraryofcode.ml/api/ping');
    });
    app.get('/api/interactive', function(req, res) {
      res.redirect(302, 'https://www.libraryofcode.ml/api/interactive/home');
    });
    app.get('/cdn/:file', function(req, res) {
      res.status(200).sendFile(path.join(__dirname + `/cdn/${req.params.file}`));
    });
    app.get('/', function(req, res) {
      res.sendFile(path.join(__dirname + '/system/home/home.html'));
    });
    app.get('/help', function(req, res) {
      res.sendFile(path.join(__dirname + '/system/home/support.html'));
    });
    app.get('/garnet/help', function(req, res) {
      res.status(302).redirect('http://garnet.libraryofcode.ml:8800');
    });
    app.delete('/api/member/:userID/roles/:roleID', function(req, res) {
      if (req.headers.authorization !== client.tokens.get(req.params.userID)) return res.sendStatus(401);
      if (!client.users.get(req.params.userID)) return res.sendStatus(404);
      //if (!client.guilds.get('446067825673633794').members.get(req.params.userID).roles.has(req.params.roleID)) res.status(406).send('Provided user does not have this role to begin with.');

      try {
        client.guilds.get('446067825673633794').members.get(req.params.userID).removeRole(req.params.roleID, 'Request done via API');
        res.sendStatus(200);
      } catch (err) {
        res.status(500).send(`Internal Server Error | ${err}`);
      }
    });
    app.put('/api/member/:userID/roles/:roleID', function(req, res) {
      if (req.headers.authorization !== client.tokens.get(req.params.userID)) return res.sendStatus(401);
      const allowedRoles = ['506974201916162048', '506974269046128650', '506974312973205514', '506974352378560522', '506974242773008420', '506974339900637184', '506974419076513825', '506974449346805771', '513359640923340801', '471046343637598210', '458211172303241227', '518079499477319681'];
      if (!req.params.roleID) return res.status(300).send(allowedRoles);
      if (req.params.roleID === 'holidays') {
        client.guilds.get('446067825673633794').members.get(req.params.userID).addRole('519420786721947649', 'Request done via API | Holiday Easter Egg');
        return res.sendStatus(201);
      }
      if (!allowedRoles.includes(req.params.roleID)) return res.status(405).send('Role ID paramater is not in the allowed roles index.');
      if (!client.users.get(req.params.userID)) return res.sendStatus(403);
      if (client.guilds.get('446067825673633794').members.get(req.params.userID).roles.has(req.param.roleID)) return res.status(406).send('Provided guild member already has requested role.');
      try {
        client.guilds.get('446067825673633794').members.get(req.params.userID).addRole(req.params.roleID, 'Request done via API');
        res.sendStatus(200);
      } catch (err) {
        res.status(500).send(`Internal Server Error | ${err}`);
      }
    });
    app.get('/api/client/:id', function(req, res) {
      const thisUser = req.params.id;
      if (!client.approved.get(thisUser)) return res.sendStatus(404);
      if (req.headers.authorization !== '446067825673633794')
        return res.status(403).send('Unauthorized access, please contact your system administrator.');
      let prefix;
      try {
        prefix = client.approved.get(thisUser, 'prefix');
      }
      catch (err) {
        prefix = err;
      }
      const thisObject = {
        client: {
          name: client.approved.get(thisUser, 'username'),
          id: thisUser,
          owner: client.approved.get(thisUser, 'owner'),
          prefix: prefix
        },
        approval: {
          type: client.approved.get(thisUser, 'type'),
          staff: client.approved.get(thisUser, 'staff'),
          time: client.approved.get(thisUser, 'time')
        }
      };
      res.status(200).send(thisObject);
    });
    app.put('/api/client/:id/:prefix', function(req, res) {
      const thisUser = client.guilds.get('446067825673633794').members.get(req.params.id);
      if (!thisUser.user.bot)
        return res.status(405).send('Cannot edit a regular member.');
      const owner = req.headers.owner;
      let thisOwner;
      try {
        thisOwner = client.guilds.get('446067825673633794').members.get(owner).user.tag;
      }
      catch (err) {
        return res.sendStatus(404);
      }
      if (client.approved.get(thisUser.id, 'owner') !== thisOwner)
        return res.status(403).send('Cannot authorize client owner.');
      if (client.tokens.get(owner) !== req.headers.authorization)
        return res.status(403).send('Authorization error');
      const prefix = req.params.prefix;
      console.log(prefix);
      client.approved.set(thisUser.id, prefix, 'prefix');
      res.status(200).send(`Prefix for ${thisUser.user.tag} edited to ${prefix}`);
    });
    app.get('/api/member/:id', function(req, res) {
      const thisUser = client.guilds.get('446067825673633794').members.get(req.params.id);
      if (req.headers.authorization !== '446067825673633794')
        return res.status(403).send('Unauthorized access, please contact your system administrator.');
      const thisObject = {
        user: {
          username: thisUser.user.username,
          discriminator: thisUser.user.discriminator,
          id: thisUser.user.id,
          avatar: thisUser.user.avatarURL,
          createdAt: new Date(thisUser.user.createdAt).toLocaleString('en-us'),
          bot: thisUser.user.bot
        },
        member: {
          nickname: thisUser.displayName,
          joinedAt: new Date(thisUser.joinedAt).toLocaleString('en-us'),
          //permissions: thisUser.permissions,
          //roles: thisUser.roles,
          highestRole: thisUser.highestRole.name//,
          //lastSeen: new Date(thisUser.lastMessage.createdAt).toLocaleString('en-us')
        }
      };
      res.status(200).send(thisObject);
    });
    app.get('/api/token/:id', function(req, res) {
      if (req.headers.authorization !== client.config.adminAuth)
        return res.status(403).send('Unauthorized access, this is only usable by the systems administrator.');
      try {
        client.guilds.get('446067825673633794').members.get(req.params.id);
      }
      catch (err) {
        return res.status(400).send('Member not found.');
      }
      const Token = require('./system/class/token.js');
      const token = new Token(req.params.id).genToken;
      client.tokens.set(req.params.id, token);
      res.status(200).send(client.tokens.get(req.params.id));
    });
    app.get('/api/ping', function(req, res) {
      res.sendStatus(200);
    });
    app.post('/api/member/:id/', function(req, res) {
      const thisUser = client.guilds.get('446067825673633794').members.get(req.params.id);
      if (req.headers.authorization !== client.tokens.get(req.params.id))
        return res.status(401);
      const newNick = req.headers.nick;
      thisUser.setNickname(newNick, `Request with API | Authorization: ${req.headers.authorization}`).catch(e => console.log(e));
      res.sendStatus(200);
    });
    app.get('/docs', function(req, res) {
      res.redirect('/docs/home');
    });
    app.get('/docs/home', function(req, res) {
      res.sendFile(path.join(__dirname + '/templates/home.html'));
    });
    app.get('/docs/client', function(req, res) {
      res.sendFile(path.join(__dirname + '/templates/client.html'));
    });
    app.get('/docs/member', function(req, res) {
      res.sendFile(path.join(__dirname + '/templates/member.html'));
    });

    // API Interactive Pages //
    app.get('/api/interactive/home', function(req, res) {
      res.sendFile(path.join(__dirname + '/interactive/home.html'));
    });
    app.get('/api/interactive/pages/selfrole', function(req, res) {
      res.sendFile(path.join(__dirname + '/interactive/selfRole.html'));
    });
    app.get('/api/interactive/pages/memberdata', function(req, res) {
      res.sendFile(path.join(__dirname + '/interactive/memberData.html'));
    });
    app.get('/api/interactive/pages/removerole', function(req, res) {
      res.sendFile(path.join(__dirname + '/interactive/removeRole.html'));
    });

    // API Interative Functions //
    const axios = require('axios');
    
    app.post('/api/interactive/functions/selfrole', async function(req, res) {
      try {
        const method = await axios({
          method: 'put',
          url: `https://sas.libraryofcode.ml/api/member/${req.body.userID}/roles/${req.body.roleID}`,
          headers: {
            authorization: req.body.authorization
          }
        });
        await res.sendStatus(method.status);
      } catch (err) {
        res.status(500).send(`Internal Server Error | ${err}`);
      }
    });
    app.post('/api/interactive/functions/removerole', async function(req, res) {
      try {
        const method = await axios({
          method: 'delete',
          url: `https://sas.libraryofcode.ml/api/member/${req.body.userID}/roles/${req.body.roleID}`,
          headers: {
            authorization: req.body.authorization
          }
        });
        await res.sendStatus(method.status);
      } catch (err) {
        res.status(500).send(`Internal Server Error | ${err}`);
      }
    });
    app.post('/api/interactive/functions/memberdata', async function(req, res) {
      const method = await axios({
        method: 'get',
        url: `https://sas.libraryofcode.ml/api/member/${req.body.userID}`,
        headers: {
          authorization: '446067825673633794'
        }
      });
      const user = JSON.stringify(method.data.user);
      const member = JSON.stringify(method.data.member);

      res.send(`${user}\n${member}`);
    });

    app.get('*', function(req, res) {
      res.status(404).sendFile(path.join(__dirname + '/system/home/404.html'));
    });
  }
}
module.exports = server;
