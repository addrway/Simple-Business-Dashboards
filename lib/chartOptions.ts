export const palette=['#2563EB','#7C3AED','#059669','#D97706','#DC2626','#0891B2'];
export const simpleBarOptions=(labels:string[],values:number[])=>({color:palette,tooltip:{trigger:'axis'},legend:{show:true},xAxis:{type:'category',data:labels},yAxis:{type:'value'},series:[{type:'bar',data:values,animationDuration:700}]});
export const simpleDonutOptions=(data:{name:string;value:number}[])=>({color:palette,tooltip:{trigger:'item'},legend:{show:true},series:[{type:'pie',radius:['45%','70%'],data,animationDuration:700}]});
