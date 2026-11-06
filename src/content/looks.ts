// Stil önerilerinin görsel karşılıkları: makyaj, saç ve kombin parçaları (12 burç).
// Görseller uygulama içinde çizilir; Pinterest araması için hazır anahtar kelimeler de verilir.
import type { L } from './base';
const l = (tr: string, en: string): L => ({ tr, en });

export type Liner = 'none' | 'thin' | 'winged' | 'smoky' | 'graphic';
export type Brow = 'soft' | 'natural' | 'bold';
export interface MakeupLook { name: L; shadow: string; liner: Liner; lip: string; gloss: boolean; blush: string; brow: Brow; glow: boolean; freckles?: boolean; q: string }
export interface HairLook { name: L; length: 1 | 2 | 3 | 4; texture: 'straight' | 'wavy' | 'curly'; up: 'none' | 'bun' | 'ponytail'; bangs: boolean; color: string; q: string }

export const MAKEUP: MakeupLook[] = [
  { name: l('Kırmızı ruj, belirgin kaş', 'Red lip, bold brow'), shadow: '#B5523B', liner: 'thin', lip: '#C8102E', gloss: false, blush: '#E07A5F', brow: 'bold', glow: false, q: 'red lip bold brow minimal makeup' },
  { name: l('Yumuşak ışıltı, çıplak tonlar', 'Soft glow, nude tones'), shadow: '#C9A27E', liner: 'none', lip: '#C98B8B', gloss: true, blush: '#E8B4B8', brow: 'natural', glow: true, q: 'soft glam nude makeup glowing skin' },
  { name: l('Renkli ve oyunbaz', 'Colourful and playful'), shadow: '#87CEEB', liner: 'graphic', lip: '#F28482', gloss: true, blush: '#F7A8B8', brow: 'natural', glow: true, q: 'playful pastel graphic eyeliner makeup' },
  { name: l('Nemli, inci gibi parlak', 'Dewy and pearly'), shadow: '#C9B8E8', liner: 'none', lip: '#E3A6A1', gloss: true, blush: '#F4B6C2', brow: 'soft', glow: true, q: 'soft dewy pearl makeup' },
  { name: l('Altın ve bronz glam', 'Gold and bronze glam'), shadow: '#C68B2C', liner: 'winged', lip: '#A0522D', gloss: false, blush: '#D08C60', brow: 'bold', glow: true, q: 'golden bronze glam makeup winged liner' },
  { name: l('Temiz ve doğal', 'Clean and natural'), shadow: '#B9A28A', liner: 'thin', lip: '#C49A8C', gloss: true, blush: '#E6B8A2', brow: 'natural', glow: false, q: 'clean girl makeup natural' },
  { name: l('Romantik pembe', 'Romantic pink'), shadow: '#E8B4B8', liner: 'thin', lip: '#D46A7E', gloss: true, blush: '#F2A7B5', brow: 'soft', glow: true, q: 'romantic pink makeup look' },
  { name: l('Dumanlı göz, koyu dudak', 'Smoky eye, dark lip'), shadow: '#3B2F3F', liner: 'smoky', lip: '#6D213C', gloss: false, blush: '#B5656B', brow: 'bold', glow: false, q: 'smoky eye dark lip makeup' },
  { name: l('Güneşte bronzlaşmış', 'Sun-kissed bronze'), shadow: '#CD7F32', liner: 'none', lip: '#C8643C', gloss: true, blush: '#E9967A', brow: 'natural', glow: true, freckles: true, q: 'sun kissed bronze makeup freckles' },
  { name: l('Mat ve klasik', 'Matte and classic'), shadow: '#7B6A58', liner: 'thin', lip: '#8B4A4A', gloss: false, blush: '#C08081', brow: 'bold', glow: false, q: 'matte classic makeup brick lip' },
  { name: l('Grafik eyeliner, mavi dokunuş', 'Graphic liner, a touch of blue'), shadow: '#0F52BA', liner: 'graphic', lip: '#B8A9C9', gloss: true, blush: '#D7BDE2', brow: 'natural', glow: true, q: 'graphic eyeliner blue makeup' },
  { name: l('Eterik ve ışıltılı', 'Ethereal and shimmery'), shadow: '#9FE2BF', liner: 'none', lip: '#E8A0A8', gloss: true, blush: '#F5C6CB', brow: 'soft', glow: true, q: 'ethereal shimmer makeup' },
];

export const HAIR: HairLook[] = [
  { name: l('Bakır tonlu bob', 'Copper bob'), length: 2, texture: 'straight', up: 'none', bangs: false, color: '#9A3F1E', q: 'copper bob haircut' },
  { name: l('Uzun, parlak dalgalar', 'Long glossy waves'), length: 4, texture: 'wavy', up: 'none', bangs: false, color: '#5A3A22', q: 'long glossy waves honey brown' },
  { name: l('Katlı kesim, perde kâkül', 'Layers with curtain bangs'), length: 3, texture: 'wavy', up: 'none', bangs: true, color: '#7A5230', q: 'curtain bangs layered haircut' },
  { name: l('Yumuşak romantik dalgalar', 'Soft romantic waves'), length: 4, texture: 'wavy', up: 'none', bangs: false, color: '#3E2A20', q: 'soft romantic waves hairstyle' },
  { name: l('Hacimli altın bukleler', 'Voluminous golden curls'), length: 4, texture: 'curly', up: 'none', bangs: false, color: '#B8860B', q: 'voluminous golden curls' },
  { name: l('Düz, sıkı topuz', 'Sleek low bun'), length: 3, texture: 'straight', up: 'bun', bangs: false, color: '#4A3426', q: 'sleek low bun' },
  { name: l('Romantik, hafif bukleli', 'Romantic soft curls'), length: 4, texture: 'wavy', up: 'none', bangs: false, color: '#6B4423', q: 'romantic soft curls hairstyle' },
  { name: l('Uzun, düz ve koyu', 'Long, sleek and dark'), length: 4, texture: 'straight', up: 'none', bangs: false, color: '#1B1B1B', q: 'sleek long dark hair' },
  { name: l('Plaj dalgaları', 'Beach waves'), length: 4, texture: 'wavy', up: 'none', bangs: false, color: '#A9743A', q: 'beach waves hair' },
  { name: l('Klasik düz bob', 'Classic sleek bob'), length: 2, texture: 'straight', up: 'none', bangs: false, color: '#2E2019', q: 'classic sleek bob' },
  { name: l('Pixie, renkli saç', 'Pixie with colour'), length: 1, texture: 'straight', up: 'none', bangs: true, color: '#6E5BA6', q: 'pixie cut pastel hair colour' },
  { name: l('Deniz kızı dalgaları', 'Mermaid waves'), length: 4, texture: 'wavy', up: 'none', bangs: false, color: '#C9A66B', q: 'mermaid waves blonde' },
];

export type Piece = 'blazer' | 'jacket' | 'trench' | 'knit' | 'tee' | 'blouse' | 'dress' | 'slip' | 'trousers' | 'jeans' | 'skirt' | 'sneakers' | 'boots' | 'heels' | 'loafers' | 'bag' | 'chain' | 'pearls' | 'hoops' | 'watch' | 'scarf' | 'sunglasses';
export const PIECE_NAME: Record<Piece, L> = {
  blazer: l('Blazer', 'Blazer'), jacket: l('Deri ceket', 'Leather jacket'), trench: l('Trençkot', 'Trench coat'), knit: l('Triko', 'Knit'), tee: l('Tişört', 'Tee'),
  blouse: l('Bluz', 'Blouse'), dress: l('Elbise', 'Dress'), slip: l('Saten elbise', 'Slip dress'), trousers: l('Bol paça pantolon', 'Wide-leg trousers'), jeans: l('Kot', 'Jeans'),
  skirt: l('Etek', 'Skirt'), sneakers: l('Sneaker', 'Sneakers'), boots: l('Bot', 'Boots'), heels: l('Topuklu', 'Heels'), loafers: l('Loafer', 'Loafers'),
  bag: l('Çanta', 'Bag'), chain: l('Kalın zincir', 'Chunky chain'), pearls: l('İnci kolye', 'Pearls'), hoops: l('Halka küpe', 'Hoops'), watch: l('Saat', 'Watch'),
  scarf: l('Eşarp', 'Scarf'), sunglasses: l('Güneş gözlüğü', 'Sunglasses'),
};
/** Her burç için 6 parça; renk, burcun paletinden (0–3) ya da doğrudan hex */
export const OUTFIT: { piece: Piece; c: number | string }[][] = [
  [{ piece: 'jacket', c: 2 }, { piece: 'tee', c: 3 }, { piece: 'jeans', c: '#3B5B8C' }, { piece: 'sneakers', c: 3 }, { piece: 'chain', c: '#B8B8B8' }, { piece: 'watch', c: 2 }],
  [{ piece: 'trench', c: 3 }, { piece: 'knit', c: 1 }, { piece: 'trousers', c: 0 }, { piece: 'loafers', c: '#5A3A22' }, { piece: 'bag', c: 3 }, { piece: 'pearls', c: '#F3E9D2' }],
  [{ piece: 'blouse', c: 0 }, { piece: 'skirt', c: 2 }, { piece: 'sneakers', c: 3 }, { piece: 'bag', c: 1 }, { piece: 'sunglasses', c: 1 }, { piece: 'hoops', c: '#D4AF37' }],
  [{ piece: 'knit', c: 2 }, { piece: 'dress', c: 0 }, { piece: 'loafers', c: 1 }, { piece: 'pearls', c: 0 }, { piece: 'bag', c: 3 }, { piece: 'scarf', c: 3 }],
  [{ piece: 'dress', c: 0 }, { piece: 'blazer', c: 2 }, { piece: 'heels', c: 0 }, { piece: 'hoops', c: 0 }, { piece: 'sunglasses', c: '#3A2A1A' }, { piece: 'bag', c: 3 }],
  [{ piece: 'blouse', c: 3 }, { piece: 'trousers', c: 0 }, { piece: 'blazer', c: 2 }, { piece: 'loafers', c: 2 }, { piece: 'watch', c: '#C0A060' }, { piece: 'bag', c: 1 }],
  [{ piece: 'dress', c: 0 }, { piece: 'blouse', c: 2 }, { piece: 'skirt', c: 1 }, { piece: 'heels', c: 2 }, { piece: 'pearls', c: 2 }, { piece: 'bag', c: 3 }],
  [{ piece: 'slip', c: 0 }, { piece: 'jacket', c: 0 }, { piece: 'boots', c: 0 }, { piece: 'chain', c: '#B8B8B8' }, { piece: 'sunglasses', c: 0 }, { piece: 'bag', c: 1 }],
  [{ piece: 'jeans', c: '#5B7FA6' }, { piece: 'tee', c: 2 }, { piece: 'boots', c: 1 }, { piece: 'scarf', c: 3 }, { piece: 'hoops', c: '#D4AF37' }, { piece: 'bag', c: 1 }],
  [{ piece: 'blazer', c: 0 }, { piece: 'trousers', c: 3 }, { piece: 'trench', c: 1 }, { piece: 'loafers', c: 1 }, { piece: 'watch', c: '#C0A060' }, { piece: 'bag', c: 2 }],
  [{ piece: 'jacket', c: 1 }, { piece: 'tee', c: 3 }, { piece: 'jeans', c: 0 }, { piece: 'sneakers', c: 2 }, { piece: 'sunglasses', c: 0 }, { piece: 'hoops', c: 1 }],
  [{ piece: 'slip', c: 0 }, { piece: 'knit', c: 1 }, { piece: 'heels', c: 3 }, { piece: 'pearls', c: 2 }, { piece: 'scarf', c: 1 }, { piece: 'bag', c: 3 }],
];
/** Pinterest arama sorguları (İngilizce sonuçlar çok daha zengin) */
export const OUTFIT_Q: string[] = [
  'sporty chic outfit leather jacket sneakers', 'old money outfit neutral', 'eclectic colorful outfit', 'soft romantic vintage outfit',
  'glamorous outfit gold', 'clean girl minimal outfit', 'elegant feminine outfit pastel', 'dark feminine outfit black',
  'boho outfit', 'quiet luxury outfit', 'futuristic avant garde outfit', 'ethereal dreamy outfit',
];
export const pinterest = (q: string) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`;

/** Her burç tarzı için Pinterest'ten seçilmiş 5 pin (Pinterest'in resmi gömme aracıyla gösterilir; görseller Pinterest'te kalır). */
export const OUTFIT_PINS: { id: string; t: string }[][] = [
  [{ id: '611152611979624008', t: 'Leather jacket' }, { id: '512143788888410577', t: 'Sporty chic' }, { id: '458733912063979322', t: 'Leather & sneakers' }, { id: '353743745740602544', t: 'Sweats & leather' }, { id: '231794712066622050', t: 'Black casual' }],
  [{ id: '1083326885404736616', t: 'Camel, cream, brown' }, { id: '5840674510394848', t: 'Old money neutrals' }, { id: '531354456060602617', t: 'Timeless' }, { id: '603200943872825351', t: 'Old money' }, { id: '1058627456151057528', t: 'Old money style' }],
  [{ id: '728738783507078425', t: 'Eclectic' }, { id: '756182593729873482', t: 'Eclectic style' }, { id: '730286895912436660', t: 'Maximalist' }, { id: '23081016836225074', t: 'Colorful casual' }, { id: '269582727690458138', t: 'Colorful' }],
  [{ id: '884816658048253516', t: 'Soft vintage' }, { id: '66428163251169999', t: 'Poetcore' }, { id: '83668505565632166', t: 'Feminine vintage' }, { id: '60376451250007656', t: 'Poetcore' }, { id: '231794712067061823', t: 'Vintage look' }],
  [{ id: '580119995797679158', t: 'Gold' }, { id: '775745104606109622', t: 'Glittering gold' }, { id: '695806211220687753', t: 'Golden glamour' }, { id: '447545281713701558', t: 'Black & gold' }, { id: '554576141594745901', t: 'Glamorous gold' }],
  [{ id: '21603273208213976', t: 'Clean girl' }, { id: '400538960625111376', t: 'Minimal' }, { id: '703687510560473388', t: 'Clean girl' }, { id: '649503577525266000', t: 'Clean minimal' }, { id: '761038037066760282', t: 'Clean girl' }],
  [{ id: '495818240254137217', t: 'Elegant feminine' }, { id: '187884615702909961', t: 'Elegant pastel' }, { id: '596515913178199329', t: 'Pastel pink' }, { id: '315181673943159863', t: 'Feminine' }, { id: '12525705208153878', t: 'Romantic' }],
  [{ id: '852376667000051999', t: 'Black dress' }, { id: '857583954074662224', t: 'Dark feminine' }, { id: '988258711980027772', t: 'Dark feminine' }, { id: '701717185736984057', t: 'Dark feminine' }, { id: '636485359883265835', t: 'Sophisticated black' }],
  [{ id: '318207529945931101', t: 'Boho summer' }, { id: '966725876267183806', t: 'Boho festival' }, { id: '1068901292803153995', t: 'Boho' }, { id: '202662051976891828', t: 'Boho hippie' }, { id: '850969292125756232', t: 'Fall boho' }],
  [{ id: '22518066879691827', t: 'Quiet luxury' }, { id: '681943568606438309', t: 'Quiet luxury' }, { id: '104919866312394337', t: 'Quiet luxury' }, { id: '389350330300402338', t: 'Quiet luxury' }, { id: '401172279326405544', t: 'Summer quiet luxury' }],
  [{ id: '22799541858576574', t: 'Avant-garde' }, { id: '449445237834233508', t: 'Futuristic' }, { id: '387591111661651118', t: 'Robot sleeves' }, { id: '730286895912436660', t: 'Maximalist' }, { id: '728738783507078425', t: 'Eclectic' }],
  [{ id: '656610820707378990', t: 'Fairycore' }, { id: '453245150021739122', t: 'Dreamy ethereal' }, { id: '37295503133821072', t: 'Ethereal' }, { id: '10555380371267020', t: 'Ethereal' }, { id: '532972937172968090', t: 'Dreamy' }],
];
export const pinUrl = (id: string) => `https://www.pinterest.com/pin/${id}/`;
