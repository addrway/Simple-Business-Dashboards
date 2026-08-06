'use client';
export default function EChart({empty=false}:{option?:object;empty?:boolean}){return <div className='rounded border p-6 text-sm text-slate-500'>{empty?'No data entered yet.':'Chart placeholder (echarts package unavailable in this environment).'}</div>;}
