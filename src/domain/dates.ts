const DAY=86400000;
export function parseDate(input:string):string|null {
 const value=input.trim(); if(!value) return null;
 let y:number,m:number,d:number;
 if(/^\d{4}-\d{2}-\d{2}$/.test(value)) [y,m,d]=value.split('-').map(Number);
 else if(/^\d{1,2}\.\s*\d{1,2}\.\s*\d{4}$/.test(value)) [d,m,y]=value.split('.').map(Number);
 else if(/^\d{5}$/.test(value) && Number(value)>=18264 && Number(value)<=73415) return new Date(Date.UTC(1899,11,30)+Number(value)*DAY).toISOString().slice(0,10);
 else return null;
 const date=new Date(Date.UTC(y,m-1,d));
 return y>=1950 && y<=2100 && date.getUTCFullYear()===y && date.getUTCMonth()===m-1 && date.getUTCDate()===d ? date.toISOString().slice(0,10):null;
}
export function addDays(date:string,days:number):string { return new Date(Date.parse(date+'T00:00:00Z')+days*DAY).toISOString().slice(0,10); }
export function addMonths(date:string,months:number):string {
 const [y,m,d]=date.split('-').map(Number); const first=new Date(Date.UTC(y,m-1+months,1));
 const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 first.setUTCDate(Math.min(d,last));return first.toISOString().slice(0,10);
}
