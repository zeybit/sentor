import { STYLE } from '../../src/content/style';
STYLE.forEach((s, i) => console.log(i, s.aesthetic.en, '|', s.colors.map(c => c.name.en + ' ' + c.hex).join(', ')));
