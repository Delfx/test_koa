//TODO add
//TODO added to sql to node (https://github.com/mysqljs/mysql)
//TODO added delete insert

//delete fecth


const Koa = require('koa');
const KoaRouter = require('koa-router');
const path = require('path');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');
const mysql = require('mysql');
const koastatic = require('koa-static');


const app = new Koa();
const router = new KoaRouter();

class DataBase {
    constructor() {
        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'addlist'
        });

        this.connection.on('error', function (error) {
            console.log(error);
        });

        this.connection.connect();
    }

    addThing(thing) {
        return new Promise((resolve, reject) => {
            this.connection.query('INSERT INTO `things`(`thing`) VALUES (?)', [thing], function (error, result) {
                if (error) {
                    return reject(error);
                }

                resolve(result.insertId);
            });
        })
    }

    getThings() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT `id`, `thing`, `checkbox` FROM `things`', function (error, result) {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        })
    }

    updatethings(thing, id) {
        return new Promise((resolve, reject) => {
            this.connection.query('UPDATE `things` SET `thing`="' + thing + '" WHERE `id`="' + id + '"', function (error, result) {
                if (error) {
                    return reject(error);
                }

                resolve(result.affectedRows);
            });
        })
    }

    deleteThing(id) {
        return new Promise((resolve, reject) => {
            this.connection.query('DELETE FROM `things` WHERE `id` = "' + id + '"', function (error, result) {

                if (error) {
                    return reject(error);
                }

                resolve(result.affectedRows);
            });
        })
    }
}

const dataBase = new DataBase();

app.use(koastatic(path.join(__dirname, 'static')));
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());

render(app, {
    root: path.join(__dirname, 'public'),
    layout: 'layout',
    viewExt: 'html',
    cache: false,
    debug: false
});

router.get('/', index);
router.get('/things', jsonThings);
router.post('/add', add);
router.post('/delete', deleteOne);
router.post('/update', update);

async function jsonThings(ctx) {
    try {
        const allThings = await dataBase.getThings();

        ctx.body = allThings;
    } catch (e) {
        ctx.throw(500);

        console.log(e);
    }
}

async function update(ctx) {

    try {
        const body = ctx.request.body;
        console.log(body);
        dataBase.updatethings(body.thing, body.id);
        index(ctx);
    } catch (e) {
        ctx.throw(404);

        console.log(e);
    }
}

async function deleteOne(ctx) {
    const body = ctx.request.body;
    console.log(body);

    if (!('id' in body)) {
        ctx.status = 400;
        ctx.body = 'Missing id';

        return;
    }

    const id = Number.parseInt(body.id, 10);

    if (Number.isNaN(id)) {
        ctx.status = 400;
        ctx.body = 'Invalid ID';

        return;
    }

    try {
        const affectedRows = await dataBase.deleteThing(id);

        if (affectedRows === 0) {
            ctx.status = 404;
            ctx.body = 'Not Found';

            return;
        }
    } catch (e) {
        ctx.throw(500);

        console.log(e);
    }

    ctx.body = {
        success: true
    }
    // ctx.redirect('/');
}

async function index(ctx) {
    try {
        await ctx.render('index', {
            title: 'things i love',
            things: await dataBase.getThings()
        });
    } catch (e) {
        ctx.throw(500);

        console.log(e);
    }
}

async function showAdd(ctx) {
    await ctx.render('add');
}

async function add(ctx) {
    const body = ctx.request.body;

    if (!('thing' in body)) {
        ctx.status = 400;
        ctx.body = {error: 'Add thing', success: false};

        return;
    }

    if (typeof body.thing !== 'string') {
        ctx.status = 400;
        ctx.body = {error: 'Thing is not string', success: false};

        return;
    }

    const insertId = await dataBase.addThing(body.thing);

    ctx.body = {
        id: insertId,
        success: true,
        html: await ctx.render('partial/_list', {
            things: await dataBase.getThings(),
            writeResp: false,
            layout: false
        }),
    };
}


app.listen(3000);