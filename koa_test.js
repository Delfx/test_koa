//TODO add
//TODO added to sql to node (https://github.com/mysqljs/mysql)
//TODO added delete insert


const Koa = require('koa');
const KoaRouter = require('koa-router');
const path = require('path');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');
const mysql = require('mysql');

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

    addThing(thing){
        return new Promise((resolve, reject) => {
            this.connection.query('INSERT INTO `things`(`thing`) VALUES (?)', [thing], function (error, result) {
                if (error) {
                    return reject(error);
                }

                resolve(result.affectedRows);
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

    deleteThing(id) {
        return new Promise((resolve, reject) => {
            this.connection.query('DELETE FROM `things` WHERE `id` = ?', [id], function (error, result) {
                if (error) {
                    return reject(error);
                }

                resolve(result.affectedRows);
            });
        })
    }
}

const dataBase = new DataBase();

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
router.get('/add', showAdd);
router.post('/add', add);
router.post('/delete', deleteone);

async function deleteone(ctx) {
    const body = ctx.request.body;

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

        ctx.redirect('/');
    } catch (e) {
        ctx.throw(500);

        console.log(e);
    }

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
    console.log(body.thing);
    dataBase.addThing(body.thing);
    ctx.redirect('/')
}


app.listen(3000);