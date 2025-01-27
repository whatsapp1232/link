const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();
const port = process.env.PORT || 5000; // 8080 portu, 3000 yerine 80 olmalı çünkü Nginx 80 portundan yönlendiriyor.
app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
});



// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ana sayfa (URL kısaltma formu)
app.get('/', (req, res) => {
    res.send(`
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f9;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                flex-direction: column;
            }

            .container {
                width: 100%;
                max-width: 600px;
                background-color: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                text-align: center;
                transition: all 0.3s ease;
            }

            .container:hover {
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
                transform: translateY(-5px);
            }

            h1 {
                font-size: 2rem;
                color: #333;
            }

            input[type="text"] {
                width: 80%;
                padding: 12px;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1.1rem;
                transition: border 0.3s ease;
            }

            input[type="text"]:focus {
                border-color: #4CAF50;
                outline: none;
            }

            button {
                width: 85%;
                padding: 12px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 1.1rem;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            button:hover {
                background-color: #45a049;
            }

            a {
                color: #3498db;
                text-decoration: none;
            }

            a:hover {
                text-decoration: underline;
            }

            .link {
                background-color: #f9f9f9;
                padding: 15px;
                border-radius: 4px;
                margin-bottom: 10px;
                border: 1px solid #ddd;
            }

            @media (max-width: 768px) {
                .container {
                    width: 90%;
                    padding: 15px;
                }

                h1 {
                    font-size: 1.5rem;
                }

                input[type="text"] {
                    width: 100%;
                    padding: 12px;
                    font-size: 1.1rem;
                }

                button {
                    width: 100%;
                    padding: 12px;
                    font-size: 1.1rem;
                }
            }
        </style>
        <div class="container">
            <h1>URL Kısaltıcı</h1>
            <form action="/shorten" method="POST">
                <input type="text" name="target_url" placeholder="Uzun URL girin" required />
                <input type="text" name="short_url" placeholder="Kısa URL adı (isteğe bağlı)" />
                <button type="submit">Kısalt</button>
            </form>
            <br>
            <a href="/links">Kısaltılmış URL'leri Görüntüle</a>
        </div>
    `);
});

// Kısaltılmış linklerin listeleneceği sayfa
// dotenv paketini yükleyin
require('dotenv').config();

// Şifre doğrulama middleware'i
require('dotenv').config(); // Bu doğru kullanım.


// Şifre kontrol middleware'ı
function checkPassword(req, res, next) {
    const password = req.body.password || req.query.password || '';  // Şifreyi body veya query parametrelerinden al
    const storedPassword = process.env.PASSWORD;  // .env dosyasındaki şifreyi al

    if (password === storedPassword) {
        return next();  // Şifre doğruysa, işleme devam et
    } else {
        res.redirect('/login');  // Şifre yanlışsa, login sayfasına yönlendir
    }
}

// Şifre girişi sayfası
app.get('/login', (req, res) => {
    res.send(`
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: #f4f4f9;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }

            .container {
                width: 100%;
                max-width: 400px;
                background-color: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                text-align: center;
            }

            h1 {
                font-size: 1.5rem;
                color: #333;
            }

            input[type="password"] {
                width: 80%;
                padding: 12px;
                margin: 10px 0;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1.1rem;
            }

            button {
                width: 85%;
                padding: 12px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                font-size: 1.1rem;
                cursor: pointer;
            }

            button:hover {
                background-color: #45a049;
            }

        </style>
        <div class="container">
            <h1>Şifre Girişi</h1>
            <form action="/links" method="GET">
                <input type="password" name="password" placeholder="Şifrenizi Girin" required />
                <button type="submit">Giriş Yap</button>
            </form>
        </div>
    `);
});

// /links sayfası için şifre doğrulama middleware'ini ekleyin
// Kısaltılmış linklerin listeleneceği sayfa (şifre kontrolü ile)
app.get('/links', checkPassword, (req, res) => {
    db.all('SELECT * FROM links', [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        let linksHtml = `
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f9;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    flex-direction: column;
                    min-height: 100vh;
                    padding-top: 20px;
                }

                .container {
                    width: 100%;
                    max-width: 900px;
                    background-color: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    text-align: center;
                }

                h1 {
                    font-size: 2rem;
                    color: #333;
                }

                .link {
                    background-color: #f9f9f9;
                    padding: 15px;
                    border-radius: 4px;
                    margin-bottom: 15px;
                    border: 1px solid #ddd;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s ease-in-out;
                }

                .link:hover {
                    transform: scale(1.05);
                }

                a {
                    color: #3498db;
                    text-decoration: none;
                    font-weight: bold;
                }

                a:hover {
                    text-decoration: underline;
                }

                .link p {
                    margin: 0;
                    font-size: 1.1rem;
                }

                .delete-btn {
                    background-color: #e74c3c;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                    margin-top: 10px;
                }

                .delete-btn:hover {
                    background-color: #c0392b;
                }

                @media (max-width: 768px) {
                    .container {
                        width: 90%;
                        padding: 15px;
                    }

                    h1 {
                        font-size: 1.8rem;
                    }

                    .link p {
                        font-size: 1rem;
                    }
                }
            </style>
            <div class="container">
                <h1>Kısaltılmış Linkler</h1>
        `;

        // Kısaltılmış URL'leri listeleme
        rows.forEach(row => {
            linksHtml += `
                <div class="link">
                    <p>
                        Kısa URL: <a href="/${row.short_url}" target="_blank">/${row.short_url}</a><br>
                        Hedef URL: ${row.target_url}<br>
                        <a href="/edit/${row.short_url}">Hedef URL'yi Düzenle</a><br>
                        <form action="/delete/${row.short_url}" method="POST" onsubmit="return confirmDelete();">
                            <button type="submit" class="delete-btn">Sil</button>
                        </form>
                    </p>
                </div>
            `;
        });

        linksHtml += `
        </div>
        <script>
            function confirmDelete() {
                return confirm("Bu URL'yi silmek istediğinize emin misiniz?");
            }
        </script>
        `;
        res.send(linksHtml);
    });
});



// Kısa URL'yi düzenleme sayfası
app.get('/edit/:short_url', (req, res) => {
    const short_url = req.params.short_url;

    try {
        // Veritabanında kısa URL'yi arıyoruz
        const row = db.prepare('SELECT * FROM links WHERE short_url = ?').get(short_url);

        if (row) {
            res.render('edit', { link: row });
        } else {
            res.status(404).send('Kısa URL bulunamadı.');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Bir hata oluştu.');
    }
});

        if (row) {
            res.send(`
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f9;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                    }

                    .container {
                        width: 100%;
                        max-width: 600px;
                        background-color: white;
                        border-radius: 8px;
                        padding: 20px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }

                    h1 {
                        font-size: 2rem;
                        color: #333;
                    }

                    input[type="text"] {
                        width: 80%;
                        padding: 10px;
                        margin: 10px 0;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 1rem;
                    }

                    button {
                        width: 85%;
                        padding: 10px;
                        background-color: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        font-size: 1.1rem;
                        cursor: pointer;
                    }

                    button:hover {
                        background-color: #45a049;
                    }

                    a {
                        color: #3498db;
                        text-decoration: none;
                    }

                    a:hover {
                        text-decoration: underline;
                    }

                    @media (max-width: 768px) {
                        .container {
                            width: 90%;
                            padding: 15px;
                        }

                        h1 {
                            font-size: 1.8rem;
                        }

                        input[type="text"] {
                            width: 100%;
                        }

                        button {
                            width: 100%;
                        }
                    }
                </style>
                <div class="container">
                    <h1>Hedef URL'yi Düzenle</h1>
                    <form action="/edit/${short_url}" method="POST">
                        <label for="target_url">Yeni Hedef URL:</label>
                        <input type="text" name="target_url" value="${row.target_url}" required /><br>
                        <button type="submit">Güncelle</button>
                    </form>
                </div>
            `);
        } else {
            res.status(404).send('URL bulunamadı');
        }
    });
});

// Kısa URL'yi düzenleme işlemi
app.post('/edit/:short_url', (req, res) => {
    const short_url = req.params.short_url;
    const target_url = req.body.target_url;

    // Hedef URL'yi güncelleme
    db.run('UPDATE links SET target_url = ? WHERE short_url = ?', [target_url, short_url], function(err) {
        if (err) {
            return console.log(err.message);
        }
        res.redirect('/links');
    });
});

// URL kısaltma işlemi
app.post('/shorten', (req, res) => {
    let target_url = req.body.target_url.trim();
    let short_url = req.body.short_url.trim();

    // URL'nin başında http:// ya da https:// yoksa, http:// ekliyoruz
    if (!/^https?:\/\//i.test(target_url)) {
        target_url = 'http://' + target_url;
    }

    // Kısa URL alanı boşsa, otomatik bir kısa URL oluşturuyoruz
    if (!short_url) {
        short_url = generateShortUrl(6);  // 6 karakterli rastgele kısa URL oluştur
    }

    // Kısa URL'nin benzersiz olup olmadığını kontrol ediyoruz
    db.get('SELECT * FROM links WHERE short_url = ?', [short_url], (err, row) => {
        if (err) {
            return console.log(err.message);
        }
        if (row) {
            // Kısa URL zaten varsa, kullanıcıya farklı bir isim seçmesini söylüyoruz
            return res.send('<h2>Bu kısa URL zaten alınmış. Lütfen başka bir kısa URL deneyin.</h2>');
        }

        // Kısa URL'yi veritabanına ekliyoruz
        db.run('INSERT INTO links (short_url, target_url) VALUES (?, ?)', [short_url, target_url], function(err) {
            if (err) {
                return console.log(err.message);
            }
            res.send(`
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f4f4f9;
                        margin: 0;
                        padding: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        flex-direction: column;
                    }

                    .container {
                        width: 100%;
                        max-width: 600px;
                        background-color: white;
                        border-radius: 8px;
                        padding: 20px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        text-align: center;
                    }

                    h1 {
                        font-size: 2rem;
                        color: #333;
                    }

                    a {
                        color: #3498db;
                        text-decoration: none;
                    }

                    a:hover {
                        text-decoration: underline;
                    }

                    .result {
                        margin-top: 20px;
                        background-color: #f9f9f9;
                        padding: 15px;
                        border-radius: 4px;
                        border: 1px solid #ddd;
                    }

                    .result a {
                        font-weight: bold;
                        font-size: 1.2rem;
                    }

                    @media (max-width: 768px) {
                        .container {
                            width: 90%;
                            padding: 15px;
                        }

                        h1 {
                            font-size: 1.5rem;
                        }
                    }
                </style>
                <div class="container">
                    <h1>Kısa URL Oluşturuldu</h1>
                    <div class="result">
                        <p>Kısa URL: <a href="/${short_url}" target="_blank">/${short_url}</a></p>
                        <p><a href="/">Başka bir URL kısalt</a></p>
                    </div>
                </div>
            `);
        });
    });
});



// Kısa URL ile yönlendirme
app.get('/:short_url', (req, res) => {
    const short_url = req.params.short_url;

    // Veritabanında kısa URL'yi arıyoruz
    db.get('SELECT target_url FROM links WHERE short_url = ?', [short_url], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        if (row) {
            // Kısa URL'yi yönlendiriyoruz
            res.redirect(row.target_url);
        } else {
            res.status(404).send('Kısa URL bulunamadı');
        }
    });
});

app.listen(port, () => {
    console.log(`Sunucu http://localhost:${port} adresinde çalışıyor.`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} kullanılıyor. Farklı bir port deneniyor...`);
        app.listen(3001); // Başka bir portu dener
    }
});


// Kısa URL üretmek için yardımcı fonksiyon
function generateShortUrl(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortUrl = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        shortUrl += characters[randomIndex];
    }
    return shortUrl;
}
