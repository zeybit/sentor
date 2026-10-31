import React from 'react';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

export type IconName = 'today' | 'chart' | 'portfolio' | 'matrix' | 'ask' | 'trends' | 'settings' | 'chevron' | 'help' | 'plus' | 'close';

/** 24×24 çizgi ikonlar; tek kalınlık, uçlar yuvarlak */
export default function Icon({ name, size = 22, color, filled }: { name: IconName; size?: number; color: string; filled?: boolean }) {
  const p = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'today' && (<>
        <Circle cx={12} cy={12} r={4} {...p} fill={filled ? color : 'none'} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
          const r = (a * Math.PI) / 180;
          return <Line key={a} x1={12 + 7 * Math.cos(r)} y1={12 + 7 * Math.sin(r)} x2={12 + 9.5 * Math.cos(r)} y2={12 + 9.5 * Math.sin(r)} {...p} />;
        })}
      </>)}
      {name === 'chart' && (<>
        <Circle cx={12} cy={12} r={9} {...p} />
        <Circle cx={12} cy={12} r={4.5} {...p} fill={filled ? color : 'none'} />
        <Line x1={3} y1={12} x2={7.5} y2={12} {...p} /><Line x1={16.5} y1={12} x2={21} y2={12} {...p} />
        <Line x1={12} y1={3} x2={12} y2={7.5} {...p} /><Line x1={12} y1={16.5} x2={12} y2={21} {...p} />
      </>)}
      {name === 'portfolio' && (<>
        <Path d="M3 5.5c3-1 6-1 9 .5 3-1.5 6-1.5 9-.5V19c-3-1-6-1-9 .5-3-1.5-6-1.5-9-.5Z" {...p} fill={filled ? color : 'none'} fillOpacity={0.18} />
        <Line x1={12} y1={6} x2={12} y2={19.5} {...p} />
      </>)}
      {name === 'matrix' && (<>
        <Rect x={5.5} y={5.5} width={13} height={13} {...p} />
        <Polygon points="12,2.5 21.5,12 12,21.5 2.5,12" {...p} />
        <Circle cx={12} cy={12} r={2} {...p} fill={filled ? color : 'none'} />
      </>)}
      {name === 'ask' && (<>
        <Circle cx={12} cy={12} r={9} {...p} fill={filled ? color : 'none'} fillOpacity={0.18} />
        <Path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.7.3-1 .8-1 1.5v.6" {...p} />
        <Circle cx={12} cy={16.8} r={0.6} fill={color} />
      </>)}
      {name === 'trends' && (<>
        <Polyline points="3,17 9,11 13,15 21,7" {...p} />
        <Polyline points="15.5,7 21,7 21,12.5" {...p} />
      </>)}
      {name === 'settings' && (<>
        <Line x1={4} y1={7} x2={20} y2={7} {...p} /><Line x1={4} y1={12} x2={20} y2={12} {...p} /><Line x1={4} y1={17} x2={20} y2={17} {...p} />
        <Circle cx={9} cy={7} r={2} {...p} fill={color} /><Circle cx={15} cy={12} r={2} {...p} fill={color} /><Circle cx={8} cy={17} r={2} {...p} fill={color} />
      </>)}
      {name === 'help' && (<>
        <Path d="M5 4h10a4 4 0 0 1 4 4v12H9a4 4 0 0 1-4-4Z" {...p} />
        <Line x1={9} y1={9} x2={15} y2={9} {...p} /><Line x1={9} y1={13} x2={13} y2={13} {...p} />
      </>)}
      {name === 'chevron' && <Polyline points="6,9 12,15 18,9" {...p} />}
      {name === 'plus' && (<><Line x1={12} y1={5} x2={12} y2={19} {...p} /><Line x1={5} y1={12} x2={19} y2={12} {...p} /></>)}
      {name === 'close' && (<><Line x1={6} y1={6} x2={18} y2={18} {...p} /><Line x1={18} y1={6} x2={6} y2={18} {...p} /></>)}
    </Svg>
  );
}
