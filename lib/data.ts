import { Customer, FinanceEntry, InventoryItem, ProjectTask, SaleEntry, Shipment } from './types';
export interface MetricWithEntries { id:string; name:string; module:string; entries:Array<Record<string,unknown>> }
export const businessName='Oakfield Supplies Co.';
export const financeDemo:FinanceEntry[]=[{id:'1',type:'Revenue',category:'Sales',amount:32000,date:'2026-04-01'},{id:'2',type:'Expense',category:'Payroll',amount:12000,date:'2026-04-03'}];
export const projectsDemo:ProjectTask[]=[{id:'1',taskName:'Vendor onboarding',projectName:'Q2 Ops',status:'In Progress',priority:'High',assignedTo:'Maria',dueDate:'2026-05-10'}];
export const salesDemo:SaleEntry[]=[{id:'1',name:'Bulk Paper',category:'Office',amount:5400,status:'Closed Won',date:'2026-04-22',customerName:'Northline'}];
export const logisticsDemo:Shipment[]=[{id:'1',shipmentId:'SHP-100',origin:'Dallas',destination:'Austin',carrier:'FedEx',status:'In Transit',estimatedDeliveryDate:'2026-05-05',cost:180}];
export const inventoryDemo:InventoryItem[]=[{id:'1',productName:'Printer Ink',sku:'INK-1',category:'Supplies',quantityInStock:12,reorderPoint:15,supplier:'Acme',unitCost:14}];
export const customersDemo:Customer[]=[{id:'1',customerName:'Apex Retail',email:'apex@example.com',phone:'555-1234',category:'VIP',totalSpend:22000,lastPurchaseDate:'2026-04-27'}];
export const getBusiness=async (_userId?:string)=>({id:'b1',name:businessName,plan:'Starter'});
export const getSessionUser=async ()=>({id:'u1',name:'Owner',email:'owner@oakfield.co'});
export const getMetrics=async (_businessId?:string):Promise<MetricWithEntries[]>=>[];
export const ensureDefaultMetrics=async ()=>undefined;
export const saveMetricEntry=async ()=>undefined;
export const createCustomChart=async ()=>({ok:true});
