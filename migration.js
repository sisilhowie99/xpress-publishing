const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./database.sqlite');


db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS Artist (
            id INTEGER NOT NULL PRIMARY KEY,
            name TEXT NOT NULL REQUIRED,
            date_of_birth TEXT NOT NULL REQUIRED,
            biography TEXT NOT NULL REQUIRED,
            is_currently_employed INTEGER NOT NULL REQUIRED DEFAULT 1
        )`
    );
    db.run(
        `CREATE TABLE IF NOT EXISTS Series (
            id INTEGER NOT NULL PRIMARY KEY,
            name TEXT REQUIRED,
            description TEXT REQUIRED
        )`
    );
    db.run(
        `CREATE TABLE IF NOT EXISTS Issue (
            id INTEGER NOT NULL PRIMARY KEY,
            name TEXT NOT NULL REQUIRED,
            issue_number INTEGER NOT NULL REQUIRED,
            publication_date TEXT NOT NULL REQUIRED,
            artist_id INTEGER NOT NULL REQUIRED,
            series_id INTEGER NOT NULL REQUIRED,
            FOREIGN KEY (artist_id) REFERENCES Artist (id),
            FOREIGN KEY (series_id) REFERENCES Series (id)
        )`
    )
})