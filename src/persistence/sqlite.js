// const mysql = require('mysql2/promise');
// const fs = require('fs');
// const location = process.env.SQLITE_DB_LOCATION || '/etc/todos/todo.db';

// let db;

// async function init() {
//     const dirName = require('path').dirname(location);
//     if (!fs.existsSync(dirName)) {
//         fs.mkdirSync(dirName, { recursive: true });
//     }

//     db = await mysql.createConnection({
//         host: process.env.DB_HOST,
//         user: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         database: process.env.DB_NAME,
//     });

//     if (process.env.NODE_ENV !== 'test')
//         console.log(`Using MySQL database at ${process.env.DB_HOST}`);

//     await db.execute(
//         'CREATE TABLE IF NOT EXISTS todo_items (id VARCHAR(36), name VARCHAR(255), completed BOOLEAN)'
//     );
// }

// async function teardown() {
//     await db.end();
// }

// async function getItems() {
//     const [rows] = await db.execute('SELECT * FROM todo_items');
//     return rows.map(item => ({
//         ...item,
//         completed: item.completed === 1,
//     }));
// }

// async function getItem(id) {
//     const [rows] = await db.execute('SELECT * FROM todo_items WHERE id=?', [id]);
//     return rows.map(item => ({
//         ...item,
//         completed: item.completed === 1,
//     }))[0];
// }

// async function storeItem(item) {
//     await db.execute(
//         'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
//         [item.id, item.name, item.completed ? 1 : 0]
//     );
// }

// async function updateItem(id, item) {
//     await db.execute(
//         'UPDATE todo_items SET name=?, completed=? WHERE id = ?',
//         [item.name, item.completed ? 1 : 0, id]
//     );
// }

// async function removeItem(id) {
//     await db.execute('DELETE FROM todo_items WHERE id = ?', [id]);
// }

// module.exports = {
//     init,
//     teardown,
//     getItems,
//     getItem,
//     storeItem,
//     updateItem,
//     removeItem,
// };

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const location = process.env.SQLITE_DB_LOCATION || '/etc/todos/todo.db';

let db, dbAll, dbRun;

function init() {
    const dirName = require('path').dirname(location);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    return new Promise((acc, rej) => {
        db = new sqlite3.Database(location, err => {
            if (err) return rej(err);

            if (process.env.NODE_ENV !== 'test')
                console.log(`Using sqlite database at ${location}`);

            db.run(
                'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean)',
                (err, result) => {
                    if (err) return rej(err);
                    acc();
                },
            );
        });
    });
}

async function teardown() {
    return new Promise((acc, rej) => {
        db.close(err => {
            if (err) rej(err);
            else acc();
        });
    });
}

async function getItems() {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM todo_items', (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                ),
            );
        });
    });
}

async function getItem(id) {
    return new Promise((acc, rej) => {
        db.all('SELECT * FROM todo_items WHERE id=?', [id], (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                )[0],
            );
        });
    });
}

async function storeItem(item) {
    return new Promise((acc, rej) => {
        db.run(
            'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
            [item.id, item.name, item.completed ? 1 : 0],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function updateItem(id, item) {
    return new Promise((acc, rej) => {
        db.run(
            'UPDATE todo_items SET name=?, completed=? WHERE id = ?',
            [item.name, item.completed ? 1 : 0, id],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
} 

async function removeItem(id) {
    return new Promise((acc, rej) => {
        db.run('DELETE FROM todo_items WHERE id = ?', [id], err => {
            if (err) return rej(err);
            acc();
        });
    });
}

module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};

