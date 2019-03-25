const Koa = require('koa');
const route = require('koa-route');
const bodyparser = require('koa-bodyparser');
const http = require('http');
const config = require('./config')

const request = require('./request');
const utilCustom = require('./utilCustom');
const path = require('path');
const fs = require('fs');

const ctx_types = {
    js: 'html',
    css: 'css'
};

const app = new Koa();
(async () =>
{
    app.use(bodyparser({ jsonLimit: '5mb', formLimit: '5mb' }));

    app.use(route.get('/' , async (ctx) =>
    {
        ctx.type = 'html';
        ctx.body = fs.createReadStream(path.join(__dirname, 'static', 'index.html'));
    }));

    let assets = await utilCustom.getdir(path.join(__dirname, 'static', 'assets'), '/');
   
    for (let i = 0; i < assets.length; i++)
    {

        app.use(route.get('' + assets[i].name, async (ctx) =>
        {   
           
            ctx.type = ctx_types[assets[i].type];
            ctx.body = fs.createReadStream(assets[i].path);
        }));
    }
    app.use(route.post('/cbrInfo', async (ctx) =>
    {
        let req = ctx.request.body;

        let res = await request[req.model][req.action](req.params);
        ctx.body = JSON.stringify(res);
    
    }));

    http.createServer(app.callback()).listen(config.server.port, config.server.host);
    console.log('HTTP server is listening', config.server.port, 'on', config.server.host)
})();


