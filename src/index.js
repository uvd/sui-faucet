const Router = require('@koa/router');
const Koa = require('koa');
const send_sui = require('./send-sui');

const app = new Koa();
const router = new Router();

router.get('/:address', ctx => {
    send_sui.send(ctx.params.address, 1)
    ctx.body = `send  ${ctx.params.address}  1 SUI`
})

router.get('/:address/:amount', ctx => {
    let amount = parseInt(ctx.params.amount);
    if (amount > 100) {
        amount = 100;
    }
    send_sui.send(ctx.params.address, amount)
    ctx.body = `send  ${ctx.params.address}  ${amount} SUI`
})

app
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000);
