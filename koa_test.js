//TODO added to sql to node (https://github.com/mysqljs/mysql)
//TODO password encription bcrypt
//TODO add addUSER???
//TODO login strategy

const Koa = require('koa');
const KoaRouter = require('koa-router');
const path = require('path');
const render = require('koa-ejs');
const bodyParser = require('koa-bodyparser');
const mysql = require('mysql');
const koastatic = require('koa-static');
const Joi = require('@hapi/joi');
const session = require('koa-session');
const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;


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

    addUser(name, pass) {
        return new Promise((resolve, reject) => {
            this.connection.query('INSERT INTO `users`(`name`, `pass`) VALUES (?, ?)', [name, pass], function (error, result) {
                if (error) {
                    return reject(error);
                }

                resolve(result.insertId);
            });
        })
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

    getThingOne() {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT `id`, `thing`, `checkbox` FROM `things` ORDER BY id DESC LIMIT 1', function (error, result) {
                if (error) {
                    return reject(error);
                }

                resolve(result[0]);
            });
        })
    }

    checkUser(userName, password) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT * FROM `users` WHERE `name`=? AND `pass`=?', [userName, password], function (error, result) {
                if (error) {
                    return reject(error);
                }

                resolve(result[0]);
            });
        })
    }

    getUserId(id) {
        return new Promise((resolve, reject) => {
            this.connection.query('SELECT * FROM `users` WHERE `id`=?', [id], function (error, result) {
                if (error) {
                    return reject(error);
                }

                resolve(result[0]);
            });
        })
    }

    updatethings(thing, id) {
        return new Promise((resolve, reject) => {
            this.connection.query('UPDATE `things` SET `thing`=? WHERE `id`=?', [thing, id], function (error, result) {
                if (error) {
                    return reject(error);
                }

                resolve(result.affectedRows);
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
app.keys = ['i m secret'];

app.use(koastatic(path.join(__dirname, 'static')));
app.use(bodyParser());
app.keys = ['secret'];
app.use(session({}, app));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
    try {
        const userObj = await dataBase.getUserId(id);
        done(null, {
            id: userObj.id,
            username: userObj.name
        });
    } catch (e) {
        done(e);
    }
});

passport.use(new LocalStrategy(async function (username, password, done) {
    try {
        const userObj = await dataBase.checkUser(username, password);

        if (userObj) {
            done(null, {
                id: userObj.id,
                username: userObj.name
            });
        } else {
            done(null, false);
        }
    } catch (e) {
        done(e);
    }

}));

app.use(passport.initialize());
app.use(passport.session());
app.use(async (ctx, next) => {
    ctx.state.isLogged = ctx.isAuthenticated();
    await next();
});
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
router.get('/login', userLogin);
router.get('/logout', userLogout);
router.post('/registration', addUser);
router.post('/login', userCustom);
router.post('/add', add);
router.post('/delete', deleteOne);
router.post('/update', update);

async function jsonThings(ctx) {
    try {
        const allThings = await dataBase.getThings();

        ctx.body = allThings;
    } catch (e) {
        console.log(e);

        ctx.throw(500);
    }
}

async function userCustom(ctx) {
    return passport.authenticate('local', function (err, user, info, status) {
        if (err) {
            console.log(err);

            ctx.throw(500);
        }

        if (user) {
            ctx.redirect('/');
            return ctx.login(user);
        } else {
            ctx.redirect('/login');
        }
    })(ctx);
}

async function userLogout(ctx) {
    if (!ctx.isAuthenticated()) {
        ctx.status = 403;

        return;
    }

    ctx.logout();
    ctx.redirect('/');
}

async function checkUser() {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/'
    });
}

async function addUser(ctx) {
    const body = ctx.request.body;
    console.log(body);
    dataBase.addUser(body.username, body.password);
    ctx.redirect('/')
}

async function userLogin(ctx) {
    await ctx.render('login');
}

async function update(ctx) {

    try {
        const body = ctx.request.body;
        console.log(body);
        dataBase.updatethings(body.thing, body.id);

        ctx.body = {
            success: true
        }
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
        ctx.body = {
            error: 'Missing ID',
            success: false
        };

        return;
    }

    const id = Number.parseInt(body.id, 10);

    if (Number.isNaN(id)) {
        ctx.status = 400;
        ctx.body = {
            error: 'Invalid ID',
            success: false
        };

        return;
    }

    try {
        const affectedRows = await dataBase.deleteThing(id);

        if (affectedRows === 0) {
            ctx.status = 404;
            ctx.body = {
                error: 'Not Found',
                success: false
            };

            return;
        }

        ctx.body = {
            success: true
        };
    } catch (e) {
        ctx.throw(500);

        console.log(e);
    }

}

async function index(ctx) {
    // console.log(ctx.state.isLogged);
    try {
        await ctx.render('index', {
            title: 'things i love',
            things: await dataBase.getThings()
        });
    } catch (e) {
        console.log(e);

        ctx.throw(500);
    }
}

async function add(ctx) {
    const body = ctx.request.body;
    console.log(body);
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
    console.log(await dataBase.getThingOne());

    ctx.body = {
        id: insertId,
        success: true,
        html: await ctx.render('partial/_listOne', {
            thing: await dataBase.getThingOne(),
            writeResp: false,
            layout: false
        }),
    };
}


app.listen(3000);