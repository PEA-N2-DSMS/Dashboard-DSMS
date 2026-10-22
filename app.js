const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=v=>typeof v==='number'?v.toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
let raw=[],all=[],filtered=[],page=0;const keys=['center','office','group','status'];
function options(id,arr){let before=$(id).value;$(id).innerHTML='<option value="">ทั้งหมด</option>'+[...new Set(arr.map(r=>r[id]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'th')).map(v=>`<option>${esc(v)}</option>`).join('');if([...$(id).options].some(o=>o.value===before))$(id).value=before}
function sum(k){return filtered.reduce((s,r)=>s+(typeof r[k]==='number'?r[k]:0),0)}
function update(){options('office',all.filter(r=>!$('center').value||r.center===$('center').value));const q=$('q').value.trim().toLowerCase();filtered=all.filter(r=>keys.every(k=>!$(k).value||r[k]===$(k).value)&&(!q||[r.wbs,r.name,r.office,r.center].join(' ').toLowerCase().includes(q)));page=0;draw()}
function draw(){const cards=[['งานทั้งหมด',filtered.length.toLocaleString('th-TH'),'WBS ไม่ซ้ำ'],['มูลค่าตามแผนงาน',fmt(sum('planValue')),'บาท · คอลัมน์ M'],['จุดรวมงาน',new Set(filtered.map(r=>r.center).filter(Boolean)).size,'หน่วยงาน'],['การไฟฟ้า',new Set(filtered.map(r=>r.office).filter(Boolean)).size,'หน่วยงาน']];$('metrics').innerHTML=cards.map(([l,n,u])=>`<div class="metric"><small>${l}</small><strong>${n}</strong><p>${u}</p></div>`).join('');const counts=k=>Object.entries(filtered.reduce((a,r)=>(a[r[k]||'ไม่ระบุ']=(a[r[k]||'ไม่ระบุ']||0)+1,a),{})).sort((a,b)=>b[1]-a[1]);const centers=counts('center');$('bars').innerHTML=centers.map(([n,c])=>`<button class="bar" data-center="${esc(n)}"><span>${esc(n)}</span><div class="track"><div class="fill" style="width:${c/Math.max(1,...centers.map(x=>x[1]))*100}%"></div></div><b>${c}</b></button>`).join('')||'<p class="muted">ไม่พบงาน</p>';$('bars').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('center').value=b.dataset.center;update()});$('statuses').innerHTML=counts('status').map(([n,c])=>`<div class="stat"><span class="badge">${esc(n)}</span><div class="track"><div class="fill" style="width:${c/Math.max(1,filtered.length)*100}%"></div></div><b>${c}</b><span>งาน</span></div>`).join('');renderRows()}
function renderRows(){const pages=Math.max(1,Math.ceil(filtered.length/12));page=Math.min(page,pages-1);$('count').textContent=`${filtered.length} WBS · แสดงหน้าละ 12 งาน · คลิก WBS ดูรายละเอียด`;$('rows').innerHTML=filtered.slice(page*12,page*12+12).map(r=>`<tr><td><button class="wbs" data-id="${esc(r.wbs)}">${esc(r.wbs)}</button><small>${esc(r.name)}</small></td><td>${esc(r.center)}<small>${esc(r.office)}</small></td><td>${esc(r.group)}</td><td><span class="badge">${esc(r.status||'—')}</span></td>${`<td class="num">${fmt(r.planValue)}</td><td>${esc(r.kpi||'—')}</td><td>${esc(r.deadline||'—')}</td>`}</tr>`).join('')||'<tr><td colspan="8">ไม่พบข้อมูลตามตัวกรอง</td></tr>';$('page').textContent=`หน้า ${page+1} / ${pages}`;$('prev').disabled=page===0;$('next').disabled=page>=pages-1;$('rows').querySelectorAll('button').forEach(b=>b.onclick=()=>detail(b.dataset.id))}
function detail(id){const r=all.find(r=>r.wbs===id),orig=raw.filter(x=>x.wbs===id);$('detailBody').innerHTML='<h2>'+esc(id)+'</h2>'+orig.map(x=>'<p class="note">'+[['ลำดับ (A)',x.sequence],['จุดรวมงาน (B)',x.center],['การไฟฟ้า (C)',x.office],['ชื่องาน (E)',x.name],['สถานะ (J)',x.status],['มูลค่าตามแผนงาน (M)',fmt(x.planValue)],['KPI / เกณฑ์วัด AUC (N)',x.kpi],['กำหนดปิดงาน (O)',x.deadline],['หมวด / ปี (Q)',x.group]].map(([k,v])=>esc(k)+': '+esc(v??'—')).join('<br>')+'</p>').join('');$('detail').showModal()}
$('close').onclick=()=>$('detail').close();keys.forEach(k=>$(k).onchange=update);$('q').oninput=update;$('reset').onclick=()=>{keys.forEach(k=>$(k).value='');$('q').value='';update()};$('prev').onclick=()=>{page--;renderRows()};$('next').onclick=()=>{page++;renderRows()};$('export').onclick=()=>{const cols=['sequence','center','office','wbs','name','status','planValue','kpi','deadline','group'];const quote=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';const csv='\uFEFF'+[cols,...filtered.map(r=>cols.map(k=>r[k]))].map(a=>a.map(quote).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='DSMS-filtered.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
const SHEET_ID='19X2m52Usus6xGWhr32mY7CQASpt5Lg0hPBej8VOG-uo';
function parseSheet(payload){
 if(payload.status!=='ok'||!payload.table)throw Error('Google Sheets ไม่ส่งข้อมูลที่อ่านได้');
 const cols=payload.table.cols;
 if(!cols.find(c=>c.id==='D')?.label.includes('WBS')||!cols.find(c=>c.id==='M')?.label.includes('มูลค่า'))throw Error('โครงสร้างคอลัมน์ต้นฉบับเปลี่ยน กรุณาตรวจสอบ');
 const records=payload.table.rows.map(row=>{
 const cell=i=>row.c[cols.findIndex(c=>c.id===String.fromCharCode(65+i))],v=i=>cell(i)?.v??null,text=i=>cell(i)?.f??v(i);
 return {wbs:v(3),name:v(4),center:v(1),office:v(2),group:v(16),status:v(9),planValue:v(12),kpi:text(13),deadline:text(14),source:'HB_2-JA_2-M4_2',sequence:v(0)};
 }).filter(r=>typeof r.sequence==='number'&&typeof r.wbs==='string'&&r.wbs.startsWith('I-'));
 if(!records.length)throw Error('ไม่พบรายการงาน ข้อมูลเดิมยังคงอยู่');
 return records;
}
function readLive(){return new Promise((resolve,reject)=>{
 const callback='dsmsSheet'+Date.now(),script=document.createElement('script');
 const clean=()=>{clearTimeout(timer);script.remove();delete window[callback]};
 const timer=setTimeout(()=>{clean();reject(Error('หมดเวลารอ Google Sheets'))},25000);
 window[callback]=data=>{clean();try{resolve(parseSheet(data))}catch(e){reject(e)}};
 script.onerror=()=>{clean();reject(Error('เชื่อมต่อ Google Sheets ไม่สำเร็จ กรุณาตรวจสิทธิ์การอ่านหรือลองใหม่'))};
 const params=new URLSearchParams({gid:'218987743',sheet:'HB_2-JA_2-M4_2',range:'A:Q',tq:'select A,B,C,D,E,J,M,N,O,Q',headers:'1',tqx:'out:json;responseHandler:'+callback,_:String(Date.now())});
 script.src='https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/gviz/tq?'+params;
 document.head.appendChild(script);
})}
function applyRecords(records){raw=records;all=[...new Map(raw.map(r=>[r.wbs,r])).values()];keys.forEach(k=>options(k,all));update()}
async function refresh(){
 $('refresh').disabled=true;$('refresh').textContent='กำลังดึงข้อมูล…';$('error').textContent='';
 try{const records=await readLive();applyRecords(records);$('date').textContent='ดึงสำเร็จ '+new Date().toLocaleString('th-TH',{timeZone:'Asia/Bangkok'});}
 catch(e){$('error').textContent='ดึงข้อมูลล่าสุดไม่สำเร็จ: '+e.message+(all.length?' · แสดงข้อมูลเดิม':'');if(!all.length)$('date').textContent='ยังไม่มีข้อมูล';}
 finally{$('refresh').disabled=false;$('refresh').textContent='↻ ดึงข้อมูลล่าสุด'}
}
$('refresh').onclick=refresh;refresh();
