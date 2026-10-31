import { computeChart } from '../src/engine/astro';
import * as N from '../src/content/lillyNatal';
import { yearReport, solarReturnMoment } from '../src/content/lillyYear';
import { bodyLon } from '../src/engine/astro';
const ch = computeChart({year:2003,month:3,day:14,hour:9,minute:30,timeKnown:true,lat:41.01,lon:28.97,tz:'Europe/Istanbul'});
const t0=Date.now();
const lg = N.lordOfGeniture(ch); console.log('LORD', lg.lord.id, lg.lord.total, lg.text.tr.slice(0,80));
const tm = N.temperament(ch); console.log('TEMP', tm.kind, tm.secondary, tm.tally, tm.rows.length);
for (const f of [N.manners, N.wit, N.wealth, N.marriage, N.profession, N.travel, N.friends] as any[]) { const s = f(ch); console.log('\n##', s?.title.tr); s?.items.forEach((i: any) => console.log(' -', i.label?.tr ?? '', '|', i.text.tr.slice(0, 140))); }
const ch2 = computeChart({year:2001,month:8,day:2,hour:18,minute:0,timeKnown:true,lat:39.93,lon:32.85,tz:'Europe/Istanbul'});
N.concord(ch, ch2)?.items.forEach(i => console.log('C', i.text.tr.slice(0,120)));
const sr = solarReturnMoment(ch, 2026); console.log('SR', sr.toISOString(), (bodyLon('sun', sr) - ch.positions.sun.lon).toFixed(6));
const y = yearReport(ch, new Date('2026-10-31T12:00:00Z')); y?.lines.forEach(x => console.log('Y', x.label.tr, '|', x.text.tr.slice(0,140)));
console.log('ms', Date.now()-t0);
