// Ünlü ikizin için herkesçe bilinen doğum tarihleri (saatler genelde bilinmediği için yalnızca tarih).
// [ad, yıl, ay, gün, alan]
export type Celeb = [string, number, number, number, 'muzik' | 'sinema' | 'spor' | 'edebiyat' | 'is' | 'bilim' | 'sanat'];
export const CELEBS: { tr: Celeb[]; world: Celeb[] } = {
  tr: [
    ['Tarkan', 1972, 10, 17, 'muzik'], ['Sezen Aksu', 1954, 7, 13, 'muzik'], ['Barış Manço', 1943, 1, 2, 'muzik'], ['Ajda Pekkan', 1946, 2, 12, 'muzik'],
    ['Zeki Müren', 1931, 12, 6, 'muzik'], ['Müslüm Gürses', 1953, 5, 7, 'muzik'], ['Ferdi Tayfur', 1945, 11, 15, 'muzik'], ['Sertab Erener', 1964, 12, 4, 'muzik'],
    ['Cem Karaca', 1945, 4, 5, 'muzik'], ['Hadise', 1985, 10, 22, 'muzik'], ['Sıla', 1980, 2, 17, 'muzik'], ['Mabel Matiz', 1986, 1, 5, 'muzik'],
    ['Gülşen', 1976, 4, 29, 'muzik'], ['Mustafa Sandal', 1970, 1, 11, 'muzik'], ['Kenan Doğulu', 1974, 10, 31, 'muzik'], ['Murat Boz', 1980, 3, 7, 'muzik'],
    ['Edis', 1990, 1, 31, 'muzik'], ['Aleyna Tilki', 2000, 3, 28, 'muzik'], ['Ebru Gündeş', 1974, 10, 12, 'muzik'], ['İbrahim Tatlıses', 1952, 1, 1, 'muzik'],
    ['Kemal Sunal', 1944, 11, 11, 'sinema'], ['Cem Yılmaz', 1973, 4, 23, 'sinema'], ['Şener Şen', 1941, 12, 26, 'sinema'], ['Türkan Şoray', 1945, 6, 28, 'sinema'],
    ['Haluk Bilginer', 1954, 6, 5, 'sinema'], ['Hülya Avşar', 1963, 10, 10, 'sinema'], ['Kenan İmirzalıoğlu', 1974, 6, 18, 'sinema'], ['Beren Saat', 1984, 2, 26, 'sinema'],
    ['Kıvanç Tatlıtuğ', 1983, 10, 27, 'sinema'], ['Hande Erçel', 1993, 11, 24, 'sinema'], ['Burak Özçivit', 1984, 12, 24, 'sinema'], ['Kerem Bürsin', 1987, 6, 4, 'sinema'],
    ['Serenay Sarıkaya', 1992, 7, 1, 'sinema'], ['Demet Özdemir', 1992, 2, 26, 'sinema'], ['Çağatay Ulusoy', 1990, 9, 23, 'sinema'], ['Engin Akyürek', 1981, 10, 12, 'sinema'],
    ['Tuba Büyüküstün', 1982, 7, 5, 'sinema'], ['Acun Ilıcalı', 1969, 5, 29, 'is'],
    ['Arda Turan', 1987, 1, 30, 'spor'], ['Hakan Şükür', 1971, 9, 1, 'spor'], ['Fatih Terim', 1953, 9, 4, 'spor'], ['Naim Süleymanoğlu', 1967, 1, 23, 'spor'],
    ['Hidayet Türkoğlu', 1979, 3, 19, 'spor'], ['Mesut Özil', 1988, 10, 15, 'spor'], ['Hakan Çalhanoğlu', 1994, 2, 8, 'spor'], ['Arda Güler', 2005, 2, 25, 'spor'],
    ['Orhan Pamuk', 1952, 6, 7, 'edebiyat'], ['Elif Şafak', 1971, 10, 25, 'edebiyat'], ['Nazım Hikmet', 1902, 1, 15, 'edebiyat'], ['Aziz Sancar', 1946, 9, 8, 'bilim'],
  ],
  world: [
    ['Taylor Swift', 1989, 12, 13, 'muzik'], ['Beyoncé', 1981, 9, 4, 'muzik'], ['Rihanna', 1988, 2, 20, 'muzik'], ['Lady Gaga', 1986, 3, 28, 'muzik'],
    ['Ariana Grande', 1993, 6, 26, 'muzik'], ['Billie Eilish', 2001, 12, 18, 'muzik'], ['Harry Styles', 1994, 2, 1, 'muzik'], ['Selena Gomez', 1992, 7, 22, 'muzik'],
    ['Justin Bieber', 1994, 3, 1, 'muzik'], ['Ed Sheeran', 1991, 2, 17, 'muzik'], ['Adele', 1988, 5, 5, 'muzik'], ['Bruno Mars', 1985, 10, 8, 'muzik'],
    ['The Weeknd', 1990, 2, 16, 'muzik'], ['Drake', 1986, 10, 24, 'muzik'], ['Dua Lipa', 1995, 8, 22, 'muzik'], ['Shakira', 1977, 2, 2, 'muzik'],
    ['Jennifer Lopez', 1969, 7, 24, 'muzik'], ['Madonna', 1958, 8, 16, 'muzik'], ['Michael Jackson', 1958, 8, 29, 'muzik'], ['Elvis Presley', 1935, 1, 8, 'muzik'],
    ['Freddie Mercury', 1946, 9, 5, 'muzik'], ['John Lennon', 1940, 10, 9, 'muzik'], ['Miley Cyrus', 1992, 11, 23, 'muzik'], ['Katy Perry', 1984, 10, 25, 'muzik'],
    ['Eminem', 1972, 10, 17, 'muzik'], ['Olivia Rodrigo', 2003, 2, 20, 'muzik'], ['Sabrina Carpenter', 1999, 5, 11, 'muzik'], ['Bad Bunny', 1994, 3, 10, 'muzik'],
    ['Lisa (BLACKPINK)', 1997, 3, 27, 'muzik'], ['Jennie (BLACKPINK)', 1996, 1, 16, 'muzik'], ['Rosé (BLACKPINK)', 1997, 2, 11, 'muzik'], ['Jisoo (BLACKPINK)', 1995, 1, 3, 'muzik'],
    ['Jungkook (BTS)', 1997, 9, 1, 'muzik'], ['V (BTS)', 1995, 12, 30, 'muzik'], ['Jimin (BTS)', 1995, 10, 13, 'muzik'],
    ['Zendaya', 1996, 9, 1, 'sinema'], ['Tom Holland', 1996, 6, 1, 'sinema'], ['Timothée Chalamet', 1995, 12, 27, 'sinema'], ['Leonardo DiCaprio', 1974, 11, 11, 'sinema'],
    ['Brad Pitt', 1963, 12, 18, 'sinema'], ['Angelina Jolie', 1975, 6, 4, 'sinema'], ['Jennifer Aniston', 1969, 2, 11, 'sinema'], ['Johnny Depp', 1963, 6, 9, 'sinema'],
    ['Keanu Reeves', 1964, 9, 2, 'sinema'], ['Tom Cruise', 1962, 7, 3, 'sinema'], ['Will Smith', 1968, 9, 25, 'sinema'], ['Meryl Streep', 1949, 6, 22, 'sinema'],
    ['Scarlett Johansson', 1984, 11, 22, 'sinema'], ['Margot Robbie', 1990, 7, 2, 'sinema'], ['Emma Watson', 1990, 4, 15, 'sinema'], ['Marilyn Monroe', 1926, 6, 1, 'sinema'],
    ['Audrey Hepburn', 1929, 5, 4, 'sinema'], ['Pedro Pascal', 1975, 4, 2, 'sinema'], ['Jenna Ortega', 2002, 9, 27, 'sinema'], ['Robert Pattinson', 1986, 5, 13, 'sinema'],
    ['Kristen Stewart', 1990, 4, 9, 'sinema'], ['Morgan Freeman', 1937, 6, 1, 'sinema'], ['Al Pacino', 1940, 4, 25, 'sinema'], ['Robert De Niro', 1943, 8, 17, 'sinema'],
    ['Nicole Kidman', 1967, 6, 20, 'sinema'], ['Julia Roberts', 1967, 10, 28, 'sinema'], ['Cillian Murphy', 1976, 5, 25, 'sinema'], ['Ryan Gosling', 1980, 11, 12, 'sinema'],
    ['Chris Hemsworth', 1983, 8, 11, 'sinema'], ['Gal Gadot', 1985, 4, 30, 'sinema'], ['Natalie Portman', 1981, 6, 9, 'sinema'], ['Anne Hathaway', 1982, 11, 12, 'sinema'],
    ['Kim Kardashian', 1980, 10, 21, 'is'], ['Kylie Jenner', 1997, 8, 10, 'is'], ['Kendall Jenner', 1995, 11, 3, 'sanat'], ['Gigi Hadid', 1995, 4, 23, 'sanat'],
    ['Bella Hadid', 1996, 10, 9, 'sanat'], ['Hailey Bieber', 1996, 11, 22, 'sanat'], ['Frida Kahlo', 1907, 7, 6, 'sanat'], ['Oprah Winfrey', 1954, 1, 29, 'is'],
    ['Steve Jobs', 1955, 2, 24, 'is'], ['Bill Gates', 1955, 10, 28, 'is'], ['Elon Musk', 1971, 6, 28, 'is'], ['Mark Zuckerberg', 1984, 5, 14, 'is'],
    ['Albert Einstein', 1879, 3, 14, 'bilim'],
    ['Cristiano Ronaldo', 1985, 2, 5, 'spor'], ['Lionel Messi', 1987, 6, 24, 'spor'], ['Serena Williams', 1981, 9, 26, 'spor'], ['LeBron James', 1984, 12, 30, 'spor'],
    ['Usain Bolt', 1986, 8, 21, 'spor'], ['Rafael Nadal', 1986, 6, 3, 'spor'], ['Roger Federer', 1981, 8, 8, 'spor'],
  ],
};
export const FIELD: Record<Celeb[4], { tr: string; en: string }> = {
  muzik: { tr: 'Müzik', en: 'Music' }, sinema: { tr: 'Sinema ve dizi', en: 'Film and TV' }, spor: { tr: 'Spor', en: 'Sports' }, edebiyat: { tr: 'Edebiyat', en: 'Literature' },
  is: { tr: 'İş dünyası', en: 'Business' }, bilim: { tr: 'Bilim', en: 'Science' }, sanat: { tr: 'Moda ve sanat', en: 'Fashion and art' },
};
