// Kader Matrisi (Matrix of Destiny, N. Ladini yöntemi): doğum tarihinden 22 Büyük Arkana ile noktalar.
// İndirgeme: 22'den büyük toplamın rakamları bir kez toplanır (22 olduğu gibi kalır).
// Nokta adları yaygın hesaplayıcılarla aynı düzendedir; formüller destiny-matrix-calculator (PyPI) ile karşılaştırılmıştır.

export const red = (n: number): number => (n > 22 ? (n % 10) + Math.floor(n / 10) : n);
const digitSum = (n: number) => String(Math.abs(n)).split('').reduce((s, d) => s + Number(d), 0);

export interface Matrix {
  // Kişisel kare (düz): A=gün (sol), B=ay (üst), C=yıl (sağ), D=alt; E=merkez
  A: number; B: number; C: number; D: number; E: number;
  // Ata karesi (çapraz): F=sol üst (A+B), G=sağ üst (B+C), H=sağ alt (C+D), I=sol alt (D+A)
  F: number; G: number; H: number; I: number;
  // İç noktalar: A1=A+E, B1=B+E, C1=C+E, D1=D+E; dış ara noktalar: A2=A+A1 ...
  A1: number; B1: number; C1: number; D1: number;
  A2: number; B2: number; C2: number; D2: number;
  // Kalp (Anahata) noktaları
  AH: number; BH: number;
  // Aşk–para kanalı: X = C1+D1 (kesişim), love = D1+X, money = C1+X
  X: number; love: number; money: number;
  // Ata karesinin merkezi ve iç noktaları
  U: number; F1: number; F2: number; G1: number; G2: number; H1: number; H2: number; I1: number; I2: number;
  // Amaçlar
  sky: number; earth: number; personal: number; male: number; female: number; social: number; spiritual: number; planetary: number;
  // Karmik kuyruk (dıştan içe): D, D2, D1
  tail: [number, number, number];
  // Yetenek (üst kol): B, B2, B1
  talent: [number, number, number];
}

export function destinyMatrix(day: number, month: number, year: number): Matrix {
  const A = red(day), B = red(month), C = red(digitSum(year));
  const D = red(A + B + C);
  const E = red(A + B + C + D);
  const F = red(A + B), G = red(B + C), H = red(C + D), I = red(D + A);
  const A1 = red(A + E), B1 = red(B + E), C1 = red(C + E), D1 = red(D + E);
  const A2 = red(A + A1), B2 = red(B + B1), C2 = red(C + C1), D2 = red(D + D1);
  const AH = red(A1 + E), BH = red(B1 + E);
  const X = red(C1 + D1), love = red(D1 + X), money = red(C1 + X);
  const U = red(F + G + H + I);
  const F2 = red(F + U), F1 = red(F + F2), G2 = red(G + U), G1 = red(G + G2);
  const H2 = red(H + U), H1 = red(H + H2), I2 = red(I + U), I1 = red(I + I2);
  const sky = red(B + D), earth = red(A + C), personal = red(sky + earth);
  const male = red(F + H), female = red(G + I), social = red(male + female);
  const spiritual = red(personal + social), planetary = red(social + spiritual);
  return {
    A, B, C, D, E, F, G, H, I, A1, B1, C1, D1, A2, B2, C2, D2, AH, BH, X, love, money,
    U, F1, F2, G1, G2, H1, H2, I1, I2, sky, earth, personal, male, female, social, spiritual, planetary,
    tail: [D, D2, D1], talent: [B, B2, B1],
  };
}

/** İki kişinin uyum matrisi: her nokta iki matristeki karşılığıyla toplanıp indirgenir */
export function compatMatrix(a: Matrix, b: Matrix): Matrix {
  const out: any = {};
  for (const k of Object.keys(a) as (keyof Matrix)[]) {
    const x = a[k] as any, y = b[k] as any;
    out[k] = Array.isArray(x) ? x.map((v: number, i: number) => red(v + y[i])) : red(x + y);
  }
  return out as Matrix;
}

// ---------------- Sağlık haritası (çakralar) ----------------
export type Chakra = 'sahasrara' | 'ajna' | 'vishuddha' | 'anahata' | 'manipura' | 'svadhisthana' | 'muladhara';
export interface HealthRow { chakra: Chakra; physics: number; energy: number; emotions: number }
export function healthMap(m: Matrix): { rows: HealthRow[]; total: { physics: number; energy: number; emotions: number } } {
  const pairs: [Chakra, number, number][] = [
    ['sahasrara', m.A, m.B], ['ajna', m.A2, m.B2], ['vishuddha', m.A1, m.B1], ['anahata', m.AH, m.BH],
    ['manipura', m.E, m.E], ['svadhisthana', m.D1, m.C1], ['muladhara', m.C, m.D],
  ];
  const rows = pairs.map(([chakra, physics, energy]) => ({ chakra, physics, energy, emotions: red(physics + energy) }));
  const sum = (k: 'physics' | 'energy' | 'emotions') => red(rows.reduce((s, r) => s + r[k], 0));
  return { rows, total: { physics: sum('physics'), energy: sum('energy'), emotions: sum('emotions') } };
}

// ---------------- Yaş haritası ----------------
/** Her 10 yıllık kenarda 8 nokta: 0, 1.25, 2.5, 3.75, 5, 6.25, 7.5, 8.75 yaş */
export interface AgePoint { age: number; arcana: number }
export function ageMap(m: Matrix): AgePoint[] {
  // Saat yönünde: A(0) → F(10) → B(20) → G(30) → C(40) → H(50) → D(60) → I(70) → A(80)
  const corners = [m.A, m.F, m.B, m.G, m.C, m.H, m.D, m.I, m.A];
  const out: AgePoint[] = [];
  for (let k = 0; k < 8; k++) {
    const s = corners[k], e = corners[k + 1];
    const mid = red(s + e), q1 = red(s + mid), e1 = red(s + q1), q3 = red(mid + q1), q5 = red(mid + e), q4 = red(mid + q5), q6 = red(q5 + e);
    const base = k * 10;
    out.push({ age: base, arcana: s }, { age: base + 1.25, arcana: e1 }, { age: base + 2.5, arcana: q1 }, { age: base + 3.75, arcana: q3 },
      { age: base + 5, arcana: mid }, { age: base + 6.25, arcana: q4 }, { age: base + 7.5, arcana: q5 }, { age: base + 8.75, arcana: q6 });
  }
  return out;
}
