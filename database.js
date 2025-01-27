const sqlite3 = require('sqlite3').verbose();

// Veritabanı dosyasını açıyoruz (veritabanı yoksa oluşturulacak)
const db = new sqlite3.Database('./url_shortener.db', (err) => {
  if (err) {
    console.error("Veritabanı bağlantı hatası: " + err.message);
  } else {
    console.log('Veritabanına bağlandı');
    db.run(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_url TEXT NOT NULL UNIQUE,
        target_url TEXT NOT NULL
      )
    `, (err) => {
       if (err) {
         console.error("Tablo oluşturma hatası: " + err.message);
       } else {
        console.log("Tablo oluşturuldu veya zaten mevcut");
       }
     });
   }
});

// Veritabanı bağlantısını dışa aktarıyoruz
module.exports = db;