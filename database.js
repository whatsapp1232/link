const Database = require('better-sqlite3');

// Veritabanı dosyasını açıyoruz (veritabanı yoksa oluşturulacak)
const db = new Database('./url_shortener.db', { verbose: console.log });

// URL tablosunu oluşturuyoruz
db.prepare(`
    CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_url TEXT NOT NULL UNIQUE,
        target_url TEXT NOT NULL
    )
`).run();

console.log('Veritabanı ve tablo oluşturuldu veya zaten mevcut');

// Veritabanı bağlantısını dışa aktarıyoruz
module.exports = db;
