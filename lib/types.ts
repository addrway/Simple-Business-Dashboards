export type Plan = 'Starter'|'Pro';
export interface KPI { label:string; value:string; change?:string; trend?:'up'|'down'; }
export interface FinanceEntry { id:string; type:'Revenue'|'Expense'; category:string; amount:number; date:string; note?:string }
export interface ProjectTask { id:string; taskName:string; projectName:string; status:'To Do'|'In Progress'|'Done'; priority:'Low'|'Medium'|'High'; assignedTo:string; dueDate:string }
export interface SaleEntry { id:string; name:string; category:string; amount:number; status:string; date:string; customerName:string }
export interface Shipment { id:string; shipmentId:string; origin:string; destination:string; carrier:string; status:string; estimatedDeliveryDate:string; cost:number }
export interface InventoryItem { id:string; productName:string; sku:string; category:string; quantityInStock:number; reorderPoint:number; supplier:string; unitCost:number }
export interface Customer { id:string; customerName:string; email:string; phone:string; category:'VIP'|'Regular'|'New'|'Inactive'; totalSpend:number; lastPurchaseDate:string; notes?:string }
