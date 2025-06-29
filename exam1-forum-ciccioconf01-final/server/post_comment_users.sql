BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"email"	TEXT,
	"name"	TEXT,
    "admin" BOOLEAN,
	"salt"	TEXT,
	"password"	TEXT,
	"secret"  TEXT
);
CREATE TABLE IF NOT EXISTS "posts" (
	"title"	TEXT PRIMARY KEY,
	"authorID"	INTEGER,
	"text"	TEXT,
	"maximum_comments"	INTEGER,
    "timestamp" DATE

);

CREATE TABLE IF NOT EXISTS "comments" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"text"	TEXT,
	"timestamp" DATE,
    "authorID"	INTEGER,
    "postTitle" TEXT
);

CREATE TABLE IF NOT EXISTS "likes" (

  "authorID" INTEGER,
  "commentID" INTEGER,
  "postTitle" TEXT,
  PRIMARY KEY ("authorID", "commentID", "postTitle")

);


INSERT INTO "users" VALUES (1,'luca@test.com',      'Luca',         False,      '9a2b7c4f1d3e6g8h', '42973c77ead41cbc2d9dc195a863f43b0a02e62ad42f7899cf602444c3717301','');                             
INSERT INTO "users" VALUES (2,'martina@test.com',   'Martina',      True,       'z8y7x6w5v4u3t2s1', '1fe10be9088b8751720144daa3b76d0e3b3e36d22d3ff58742c0924790f59ff9','LXBSMDTMSP2I5XFXIYRGFVWSFI');   
INSERT INTO "users" VALUES (3,'alice@test.com',     'Alice',        False,      'm1n2b3v4c5x6z7l8', 'b726d3908d71032218883ead5936d2d3d535311ae67ddc7bdadb59989f330c1b','');                             
INSERT INTO "users" VALUES (4,'giulia@test.com',    'Giulia',       True,       'f4e5d6c7b8a9g0h1', '5306554ff7c7e5fcf8a56bb0ed0b6ecbb76f5742a176965e7b7ed60621879e20','LXBSMDTMSP2I5XFXIYRGFVWSFI');   /* password='apple91' */
INSERT INTO "users" VALUES (5,'andrea@test.com',    'Andrea',       False,      'r3t5y7u9i1o2p4q6', 'ffdef4b7be856317166a59d3e02f1382eafc9504a672c8447952242e6374b55b','');                                /* password='apple91' */


-- POSTS

-- Luca (user)
INSERT INTO "posts" VALUES ('Best Budget Laptops 2025', 1, 'Looking for a good budget laptop under $700. Any suggestions?', null, '2025-06-01 10:15:00');
INSERT INTO "posts" VALUES ('Mid-range Gaming PC Build', 1, 'My recommended specs for a $1200 gaming PC build in 2025.', 2, '2025-06-05 14:30:00');

-- Martina (admin)
INSERT INTO "posts" VALUES ('Are Laser Printers Worth It?', 2, 'Considering switching from inkjet to laser. Pros and cons?', 2, '2025-06-03 09:45:00');
INSERT INTO "posts" VALUES ('Top Android Phones Right Now', 2, 'Here are my picks for the top Android smartphones this year.', 3, '2025-06-06 13:20:00');

-- Alice (user)
INSERT INTO "posts" VALUES ('Home Office Tech Setup', 3, 'Tips on setting up an efficient tech workspace at home.', 2, '2025-06-04 11:00:00');
INSERT INTO "posts" VALUES ('Best Mechanical Keyboards', 3, 'Reviewing mechanical keyboards under $150.', 9, '2025-06-07 16:10:00');

-- Giulia (admin)
INSERT INTO "posts" VALUES ('Choosing a Monitor for Photo Editing', 4, 'What specs should I prioritize for photo editing monitors?', 3, '2025-06-02 08:25:00');
INSERT INTO "posts" VALUES ('Best WiFi 6 Routers in 2025', 4, 'My recommendations for reliable WiFi 6 routers.', 10, '2025-06-08 17:40:00');

-- COMMENTS

-- Budget laptops
INSERT INTO "comments" VALUES (NULL, 'Check out the Lenovo IdeaPad Slim 5 – great value!', '2025-06-01 10:20:00', 2, 'Best Budget Laptops 2025');
INSERT INTO "comments" VALUES (NULL, 'I got the Acer Swift 3 and love it.', '2025-06-01 10:30:00', 3, 'Best Budget Laptops 2025');
INSERT INTO "comments" VALUES (NULL, 'Avoid Chromebooks unless you only need a browser.', '2025-06-01 10:45:00', 5, 'Best Budget Laptops 2025');

-- Gaming PC
INSERT INTO "comments" VALUES (NULL, 'Great build, I’d just suggest a better PSU brand.', '2025-06-05 14:45:00', null, 'Mid-range Gaming PC Build');

-- Laser printers
INSERT INTO "comments" VALUES (NULL, 'Laser is much better for volume printing.', '2025-06-03 10:10:00', null, 'Are Laser Printers Worth It?');
INSERT INTO "comments" VALUES (NULL, 'Toner lasts longer, but upfront cost is higher.', '2025-06-03 10:25:00', 5, 'Are Laser Printers Worth It?');

-- Android phones
INSERT INTO "comments" VALUES (NULL, 'Pixel 8 Pro is the best for camera quality.', '2025-06-06 13:40:00', 3, 'Top Android Phones Right Now');
INSERT INTO "comments" VALUES (NULL, 'I prefer Samsung Galaxy S24 Ultra.', '2025-06-06 13:55:00', 1, 'Top Android Phones Right Now');

-- Home office setup
INSERT INTO "comments" VALUES (NULL, 'A second monitor boosts productivity a lot.', '2025-06-04 11:20:00', 2, 'Home Office Tech Setup');
INSERT INTO "comments" VALUES (NULL, 'Invest in a good ergonomic chair too!', '2025-06-04 11:35:00', 4, 'Home Office Tech Setup');

-- Mechanical keyboards
INSERT INTO "comments" VALUES (NULL, 'I love my Keychron K6.', '2025-06-07 16:20:00', 2, 'Best Mechanical Keyboards');
INSERT INTO "comments" VALUES (NULL, 'Logitech G Pro X is pricey but solid.', '2025-06-07 16:30:00', 1, 'Best Mechanical Keyboards');
INSERT INTO "comments" VALUES (NULL, 'Try the Akko 3068 – great for the price.', '2025-06-07 16:45:00', null, 'Best Mechanical Keyboards');

-- Monitor for photo editing
INSERT INTO "comments" VALUES (NULL, 'Go for 100% sRGB or AdobeRGB coverage.', '2025-06-02 08:35:00', 3, 'Choosing a Monitor for Photo Editing');
INSERT INTO "comments" VALUES (NULL, 'Look for factory calibration and IPS panels.', '2025-06-02 08:50:00', 1, 'Choosing a Monitor for Photo Editing');
INSERT INTO "comments" VALUES (NULL, 'The Dell UltraSharp line is excellent.', '2025-06-02 09:05:00', 5, 'Choosing a Monitor for Photo Editing');

-- WiFi 6 routers
INSERT INTO "comments" VALUES (NULL, 'TP-Link Archer AX73 is solid.', '2025-06-08 18:00:00', 1, 'Best WiFi 6 Routers in 2025');
INSERT INTO "comments" VALUES (NULL, 'Netgear Nighthawk series has good range.', '2025-06-08 18:15:00', 2, 'Best WiFi 6 Routers in 2025');
INSERT INTO "comments" VALUES (NULL, 'Make sure it supports WPA3.', '2025-06-08 18:30:00', null, 'Best WiFi 6 Routers in 2025');
INSERT INTO "comments" VALUES (NULL, 'ASUS RT-AX88U is feature-packed.', '2025-06-08 18:45:00', 5, 'Best WiFi 6 Routers in 2025');


COMMIT;