'use strict';

const db = require('./db');

// WARNING: all DB operations must check that the memes belong to the loggedIn user, thus include a WHERE user=? check !!!

// get all public memes
exports.publicMemes = () => {
    return new Promise((resolve, reject) => {
        const sql = "select * from meme where private = 0";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const memes = rows.map((m) => ({
                id: m.id,
                creator: m.creator,
                image: m.image,
                private: m.private,
                title: m.title,
                font: m.font,
                colour: m.colour
            }));
            resolve(memes);
        });
    });
};

// get all protected memes
exports.protectedMemes = () => {
    return new Promise((resolve, reject) => {
        const sql = "select * from meme where private = 1";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const memes = rows.map((m) => ({
                id: m.id,
                creator: m.creator,
                image: m.image,
                private: m.private,
                title: m.title,
                font: m.font,
                colour: m.colour
            }));
            resolve(memes);
        });
    });
};

exports.getImage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "select * from image where id = ?";
        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const image = rows.map((im) => ({
                id: im.id,
                image: im.image,
                number_texts: im.number_texts,
                pos1: im.pos1,
                pos2: im.pos2,
                pos3: im.pos3
            }));
            resolve(image);
        });
    });
}

exports.getImages = () => {
    return new Promise((resolve, reject) => {
        const sql = "select * from image";
        db.all(sql, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const images = rows.map((im) => ({
                id: im.id,
                image: im.image,
                number_texts: im.number_texts,
                pos1: im.pos1,
                pos2: im.pos2,
                pos3: im.pos3
            }));
            resolve(images);
        });
    });
}

exports.getCreator = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "select id, name from creator where id = ?";
        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const creator = rows.map((cr) => ({
                id: cr.id,
                name: cr.name
            }));
            resolve(creator);
        });
    });
}

exports.getTexts = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "select * from text where meme = ?";
        db.all(sql, [id], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const texts = rows.map((txt) => ({
                id: txt.id,
                meme: txt.meme,
                image: txt.image,
                text: txt.text,
                position: txt.position
            }));
            resolve(texts);
        });
    });
}

//get the meme identified by {id}
exports.getMeme = (id, creator) => {
    return new Promise((resolve, reject) => {
        const sql = 'select * from meme where id=? and creator=?';
        db.get(sql, [id, creator], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            if (row == undefined) 
                resolve({error: 'Meme not found.'});
            else {
                const meme = {
                    id: row.id,
                    creator: row.creator,
                    image: row.image,
                    private: row.private,
                    title: row.title,
                    font: row.font,
                    colour: row.colour
                };
                resolve(meme);
            }
        });
    });
};

//Create meme
exports.addMeme = (creator, image, priv, title, font, colour) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO \
            meme (creator, image, private, title, font, colour) \
            VALUES(?, ?, ?, ?, ?, ?);';
        db.run(sql, [creator, image, priv, title, font, colour], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

//Create text
exports.addText = (meme, image, text, position) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO \
            text (meme, image, text, position) \
            VALUES(?, ?, ?, ?);';
        db.run(sql, [meme, image, text, position], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve(this.lastID);
        });
    });
};

//Delete a meme given its id
exports.deleteMeme = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'delete from meme where id=?'
        db.run(sql, [id], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};

//Delete texts related to the meme with id=<id>
exports.deleteTexts = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'delete from text where meme=?'
        db.run(sql, [id], function(err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};


