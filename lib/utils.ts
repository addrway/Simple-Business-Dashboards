import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn=(...inputs:unknown[])=>twMerge(clsx(inputs));
export const currency=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export const formatNumber=(n:number)=>new Intl.NumberFormat('en-US').format(n);
export const formatPercent=(n:number)=>`${n.toFixed(1)}%`;
