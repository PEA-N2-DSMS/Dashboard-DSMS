const STATUS_LABELS={"A0":"สร้างหมายเลขงาน WBS","A1":"ตรวจสอบข้อมูลทางบัญชี","A2":"สำรวจ / ออกแบบ / ประมาณการ","A5":"อนุมัติประมาณการ","B1":"จัดงานเข้าโครงการ / ชำระเงินแล้ว","B2":"บันทึก / โอนงบประมาณเข้า WBS","C1":"อยู่ระหว่างงานก่อสร้าง","C2":"อยู่ระหว่างจัดซื้อ / จัดจ้าง","C3":"หยุดงาน รอจัดหาพัสดุ","C4":"หยุดงานชั่วคราว – กฟภ.","C5":"หยุดงานชั่วคราว – ผู้รับจ้าง","C6":"หยุดงานชั่วคราว – งานจัดสรร","C9":"ยกเลิกสถานะ TECO","D1":"งานแล้วเสร็จ ตรวจสอบพัสดุ / ค่าใช้จ่าย","D2":"แล้วเสร็จทางเทคนิค (TECO)","D3":"รับเอกสารปิดงาน","F0":"ตรวจสอบค่าใช้จ่ายและแจ้งโอนคืนงบ","F1":"โอนคืนงบประมาณเรียบร้อย","F2":"ปิดงานทางบัญชีระดับ WBS (CLSD)","F3":"ปิดงานทางบัญชี – บางส่วน","F4":"ขึ้นสินทรัพย์ถาวรแล้ว"};
const statusText=code=>STATUS_LABELS[code]||'สถานะตามต้นฉบับ (ยังไม่มีคำอธิบายในภาพอ้างอิง)';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=v=>typeof v==='number'?v.toLocaleString('th-TH',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
let raw=[],all=[],filtered=[],page=0;const keys=['center','office','group','status','year'];
function options(id,arr){if(id==='status'){const before=$(id).value;const codes=[...new Set([...Object.keys(STATUS_LABELS),...arr.map(r=>r.status).filter(Boolean)])].sort();$(id).innerHTML='<option value="">ทั้งหมด</option>'+codes.map(s=>'<option value="'+esc(s)+'">'+esc(s)+' · '+esc(statusText(s))+'</option>').join('');$(id).value=before;return;}if(id==='year')return;if(id==='group'){const before=$(id).value;$(id).innerHTML='<option value="">ทั้งหมด</option><option value="HB_2">HB.2000 ปี 2568</option><option value="HB_3">HB.3000 ปี 2568</option><option value="JA_2">JA.2000 ปี 2568–2569</option><option value="JA_3">JA.3000 ปี 2568–2569</option><option value="M4_2">M4.2000 ปี 2569</option><option value="M4_3">M4.3000 ปี 2569</option>';$(id).value=before;return;}let before=$(id).value;$(id).innerHTML='<option value="">ทั้งหมด</option>'+[...new Set(arr.map(r=>r[id]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'th')).map(v=>`<option>${esc(v)}</option>`).join('');if([...$(id).options].some(o=>o.value===before))$(id).value=before}
function sum(k){return filtered.reduce((s,r)=>s+(typeof r[k]==='number'?r[k]:0),0)}
function update(){document.querySelectorAll('[data-project]').forEach(b=>{const active=b.dataset.project===$('group').value;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});if(typeof currentBudgets!=='undefined')renderBudget(currentBudgets);options('center',all.filter(scopeMatch));options('office',all.filter(r=>!$('center').value||r.center===$('center').value));const q=$('q').value.trim().toLowerCase();filtered=all.filter(r=>keys.every(k=>!$(k).value||(k==='year'?String(r.group||'').includes('('+$(k).value+')'):k==='group'?String(r.group||'').startsWith($(k).value+' '):r[k]===$(k).value))&&(!q||[r.wbs,r.name,r.office,r.center].join(' ').toLowerCase().includes(q)));page=0;draw()}
function draw(){renderStatusStrip();renderFullOverview();const counts=k=>Object.entries(filtered.reduce((a,r)=>(a[r[k]||'ไม่ระบุ']=(a[r[k]||'ไม่ระบุ']||0)+1,a),{})).sort((a,b)=>b[1]-a[1]);const centers=counts('center');$('bars').innerHTML=centers.map(([n,c])=>`<button class="bar" data-center="${esc(n)}"><span>${esc(n)}</span><div class="track"><div class="fill" style="width:${c/Math.max(1,...centers.map(x=>x[1]))*100}%"></div></div><b>${c}</b></button>`).join('')||'<p class="muted">ไม่พบงาน</p>';$('bars').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('center').value=b.dataset.center;update()});$('statuses').innerHTML=counts('status').map(([n,c])=>`<div class="stat"><span class="badge">${esc(n)}</span><div class="track"><div class="fill" style="width:${c/Math.max(1,filtered.length)*100}%"></div></div><b>${c}</b><span>งาน</span></div>`).join('');renderRows();renderStatusStrip()}
function renderRows(){const pages=Math.max(1,Math.ceil(filtered.length/4));page=Math.min(page,pages-1);$('count').textContent=`${filtered.length} WBS · แสดงหน้าละ 4 งาน · คลิก WBS ดูรายละเอียด`;$('rows').innerHTML=filtered.slice(page*4,page*4+4).map(r=>`<tr><td><button class="wbs" data-id="${esc(r.wbs)}">${esc(r.wbs)}</button><small>${esc(r.name)}</small></td><td>${esc(r.center)}<small>${esc(r.office)}</small></td><td>${esc(r.group)}</td><td><span class="badge" data-stage="${esc((r.status||'')[0])}" title="${esc(statusText(r.status))}">${esc(r.status||'—')}</span><small>${esc(statusText(r.status))}</small></td>${`<td class="num">${fmt(r.planValue)}</td><td>${esc(r.kpi||'—')}</td><td>${esc(r.deadline||'—')}</td>`}</tr>`).join('')||'<tr><td colspan="8">ไม่พบข้อมูลตามตัวกรอง</td></tr>';$('page').textContent=`หน้า ${page+1} / ${pages}`;$('prev').disabled=page===0;$('next').disabled=page>=pages-1;$('rows').querySelectorAll('button').forEach(b=>b.onclick=()=>detail(b.dataset.id))}
function detail(id){const r=all.find(r=>r.wbs===id),orig=raw.filter(x=>x.wbs===id);$('detailBody').innerHTML='<h2>'+esc(id)+'</h2>'+orig.map(x=>'<p class="note">'+[['ลำดับ (A)',x.sequence],['จุดรวมงาน (B)',x.center],['การไฟฟ้า (C)',x.office],['ชื่องาน (E)',x.name],['สถานะ (J)',x.status],['มูลค่าตามแผนงาน',fmt(x.planValue)],['KPI / เกณฑ์วัด AUC (N)',x.kpi],['กำหนดปิดงาน (O)',x.deadline],['หมวด / ปี (Q)',x.group]].map(([k,v])=>esc(k)+': '+esc(v??'—')).join('<br>')+'</p>').join('');$('detail').showModal()}
$('close').onclick=()=>$('detail').close();keys.forEach(k=>$(k).onchange=update);$('q').oninput=update;$('reset').onclick=()=>{keys.forEach(k=>$(k).value='');$('q').value='';update()};$('prev').onclick=()=>{page--;renderRows()};$('next').onclick=()=>{page++;renderRows()};$('export').onclick=()=>{const cols=['sequence','center','office','wbs','name','status','planValue','kpi','deadline','group'];const quote=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replace(/"/g,'""')+'"';const csv='\uFEFF'+[cols,...filtered.map(r=>cols.map(k=>r[k]))].map(a=>a.map(quote).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='DSMS-filtered.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
const SHEET_ID='19X2m52Usus6xGWhr32mY7CQASpt5Lg0hPBej8VOG-uo';
function parseSheet(payload,sheetName='HB_2-JA_2-M4_2'){
 if(payload.status!=='ok'||!payload.table)throw Error('Google Sheets ไม่ส่งข้อมูลที่อ่านได้');
 const cols=payload.table.cols;
 if(!cols.find(c=>c.id==='D')?.label.includes('WBS')||!cols.find(c=>c.id==='M')?.label.includes('มูลค่า'))throw Error('โครงสร้างคอลัมน์ต้นฉบับเปลี่ยน กรุณาตรวจสอบ');
 const records=payload.table.rows.map(row=>{
 const cell=i=>row.c[cols.findIndex(c=>c.id===String.fromCharCode(65+i))],v=i=>cell(i)?.v??null,text=i=>cell(i)?.f??v(i);
 return {wbs:v(3),name:v(4),center:v(1),office:v(2),group:v(16),status:v(9),planValue:v(12),kpi:text(13),deadline:text(14),source:sheetName,sequence:v(0),fullRow:['HB_2-JA_2-M4_2','HB_3-JA_3-M4_3'].includes(sheetName)?Array.from({length:19},(_,i)=>text(i)):null,fullHeaders:['HB_2-JA_2-M4_2','HB_3-JA_3-M4_3'].includes(sheetName)?Array.from({length:19},(_,i)=>cols.find(c=>c.id===String.fromCharCode(65+i))?.label||String.fromCharCode(65+i)):null};
 }).filter(r=>typeof r.wbs==='string'&&/^I-\d{2}-B-[A-Z0-9]+\.(HB|JA|M4)\.[23]\d{3}$/i.test(r.wbs.trim())).map(r=>({...r,wbs:r.wbs.trim()}));
 if(!records.length)throw Error('ไม่พบรายการงาน ข้อมูลเดิมยังคงอยู่');
 records.budgets=payload.table.rows.map(row=>{const v=id=>row.c[cols.findIndex(c=>c.id===id)]?.v??null;return {wbs:v('T'),allocated:v('U'),approved:v('V'),remaining:v('W')}}).filter(r=>typeof r.wbs==='string'&&r.wbs.startsWith('I-'));
 return records;
}
function readSheet(config){return new Promise((resolve,reject)=>{
 const callback='dsmsSheet'+config.gid+'_'+Date.now(),script=document.createElement('script');
 const clean=()=>{clearTimeout(timer);script.remove();delete window[callback]};
 const timer=setTimeout(()=>{clean();reject(Error('หมดเวลารอ Google Sheets'))},25000);
 window[callback]=data=>{clean();try{resolve(parseSheet(data,config.name))}catch(e){reject(e)}};
 script.onerror=()=>{clean();reject(Error('เชื่อมต่อ Google Sheets ไม่สำเร็จ กรุณาตรวจสิทธิ์การอ่านหรือลองใหม่'))};
 const params=new URLSearchParams({gid:config.gid,sheet:config.name,range:'A:W',tq:'select A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W',headers:'1',tqx:'out:json;responseHandler:'+callback,_:String(Date.now())});
 script.src='https://docs.google.com/spreadsheets/d/'+SHEET_ID+'/gviz/tq?'+params;
 document.head.appendChild(script);
})}
async function readLive(){const batches=await Promise.all([{gid:'218987743',name:'HB_2-JA_2-M4_2'},{gid:'1045580958',name:'HB_3-JA_3-M4_3'}].map(readSheet));const records=batches.flat();records.budgets=[...new Map(batches.flatMap(b=>b.budgets||[]).map(r=>[r.wbs,r])).values()];return records;}
function applyRecords(records){raw=records;all=[...new Map(raw.map(r=>[r.wbs,r])).values()];keys.forEach(k=>options(k,all));update()}
async function refresh(){
 $('refresh').disabled=true;$('refresh').textContent='กำลังดึงข้อมูล…';$('error').textContent='';
 try{const records=await readLive();applyRecords(records);renderBudget(records.budgets||[]);$('date').textContent='ดึงสำเร็จ '+new Date().toLocaleString('th-TH',{timeZone:'Asia/Bangkok'});}
 catch(e){$('error').textContent='ดึงข้อมูลล่าสุดไม่สำเร็จ: '+e.message+(all.length?' · แสดงข้อมูลเดิม':'');if(!all.length)$('date').textContent='ยังไม่มีข้อมูล';}
 finally{$('refresh').disabled=false;$('refresh').textContent='↻ ดึงข้อมูลล่าสุด'}
}
$('refresh').onclick=refresh;refresh();

function selectView(view){
 document.querySelectorAll('.view-panel').forEach(p=>p.hidden=p.dataset.panel!==view);
 document.querySelectorAll('.view-tabs button').forEach(b=>{b.classList.toggle('active',b.dataset.view===view);b.setAttribute('aria-pressed',String(b.dataset.view===view))});
}
document.querySelectorAll('.view-tabs button').forEach(b=>b.onclick=()=>selectView(b.dataset.view));
$('q').addEventListener('input',()=>{if($('q').value.trim())selectView('records')});
$('bars').addEventListener('click',e=>{if(e.target.closest('button'))selectView('records')});
selectView('budget');

var currentBudgets=[];
function renderBudget(rows){currentBudgets=rows;rows=rows.filter(r=>!$('group').value||r.wbs.includes('.'+$('group').value.split('_')[0]+'.')&&r.wbs.split('.').pop().startsWith($('group').value.split('_')[1]));
 const totals=k=>rows.reduce((sum,r)=>sum+(typeof r[k]==='number'?r[k]:0),0);
 $('budgetMetrics').innerHTML=[['ได้รับจัดสรร',totals('allocated')],['อนุมัติให้ กฟฟ.ในสังกัด',totals('approved')],['คงเหลือ',totals('remaining')]].map(([name,v])=>'<div class="metric"><small>'+name+'</small><strong>'+fmt(v)+'</strong><p>บาท</p></div>').join('');
 $('budgetRows').innerHTML=rows.map(r=>'<tr><td>'+esc(r.wbs)+'</td>'+['allocated','approved','remaining'].map(k=>'<td class="num">'+fmt(r[k])+'</td>').join('')+'</tr>').join('')||'<tr><td colspan="4">ไม่พบตารางงบประมาณในคอลัมน์ T–W</td></tr>';
}

document.querySelectorAll('[data-project]').forEach(b=>b.onclick=()=>{$('group').value=b.dataset.project;$('year').value='';$('center').value='';$('office').value='';$('status').value='';$('q').value='';update();selectView('overview')});

function scopeMatch(r){return (!$('group').value||String(r.group||'').startsWith($('group').value+' '))&&(!$('year').value||String(r.group||'').includes('('+$('year').value+')'))}
function renderStatusStrip(){
 const base=all.filter(r=>scopeMatch(r)&&(!$('center').value||r.center===$('center').value)&&(!$('office').value||r.office===$('office').value));
 const codes=[...Object.keys(STATUS_LABELS),...new Set(base.map(r=>r.status).filter(s=>s&&!STATUS_LABELS[s]))];
 $('scopeCount').textContent=base.length?base.length+' งาน · '+new Set(base.map(r=>r.center)).size+' จุดรวมงาน':'ยังไม่พบข้อมูลหมวด / ปีนี้ในคอลัมน์ Q ของชีตที่เชื่อมต่อ';
 $('statusStrip').innerHTML=codes.map(code=>{const n=base.filter(r=>r.status===code).length;return '<button title="'+esc(code+' · '+statusText(code))+'" data-stage="'+esc(code[0])+'" data-status-code="'+esc(code)+'" class="'+($('status').value===code?'active':'')+'"><span>'+esc(code)+'</span><b>'+n+'</b></button>'}).join('');
 $('statusStrip').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('status').value=b.dataset.statusCode;update();selectView('records')});
 const counts=Object.entries(base.reduce((m,r)=>{const k=(r.center||'ไม่ระบุ')+'|'+(r.status||'ไม่ระบุ');m[k]=(m[k]||0)+1;return m},{}));
 $('statuses').innerHTML=counts.filter(([k])=>!$('status').value||k.split('|')[1]===$('status').value).map(([k,n])=>{const [center,status]=k.split('|');return '<button class="status-center" data-center="'+esc(center)+'" data-code="'+esc(status)+'">'+esc(center)+' <span class="badge">'+esc(status)+' · '+esc(statusText(status))+'</span> <b>'+n+' งาน</b></button>'}).join('');
 $('statuses').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('center').value=b.dataset.center;$('status').value=b.dataset.code;update();selectView('records')});
}

var fullPage=0,fullColumnPage=0,fullRows=[];
function overviewSource(){const sourceByGroup={HB_2:'HB_2-JA_2-M4_2',JA_2:'HB_2-JA_2-M4_2',M4_2:'HB_2-JA_2-M4_2',HB_3:'HB_3-JA_3-M4_3',JA_3:'HB_3-JA_3-M4_3',M4_3:'HB_3-JA_3-M4_3'};return sourceByGroup[$('group').value]||'ทั้งสองชีต'}
function renderFullOverview(){
 fullRows=raw.filter(r=>(!$('group').value||r.source===overviewSource())&&scopeMatch(r)&&(!$('center').value||r.center===$('center').value)&&(!$('office').value||r.office===$('office').value)&&(!$('status').value||r.status===$('status').value)&&(!$('q').value.trim()||[r.wbs,r.name,r.center,r.office].join(' ').toLowerCase().includes($('q').value.trim().toLowerCase())));
 fullPage=0;officeChartPage=0;drawFullOverview();renderOfficeChart();
}
function drawFullOverview(){
 $('overviewSourceLabel').textContent=overviewSource();
 const indexes=[0,1,2,3,4,9,12,13,14];
 const heads=raw.find(r=>(!$('group').value||r.source===overviewSource())&&r.fullHeaders)?.fullHeaders||[];
 $('fullColumnTabs').innerHTML='';
 $('fullHead').innerHTML='<tr>'+indexes.map(i=>'<th>'+esc(heads[i]||'')+'</th>').join('')+'</tr>';
 const pages=Math.max(1,Math.ceil(fullRows.length/4));fullPage=Math.min(fullPage,pages-1);
 $('fullBody').innerHTML=fullRows.slice(fullPage*4,fullPage*4+4).map(r=>'<tr>'+indexes.map(i=>'<td><div class="equal-cell-content">'+ (i===3?'<button class="wbs" data-full-id="'+esc(r.wbs)+'">'+esc(r.wbs)+'</button>':esc(r.fullRow?.[i]??'—'))+'</div></td>').join('')+'</tr>').join('')||'<tr><td colspan="9">ไม่พบข้อมูลตามตัวกรองในชีตที่เลือก</td></tr>';
 $('fullBody').querySelectorAll('button').forEach(b=>b.onclick=()=>detail(b.dataset.fullId));
 $('fullCount').textContent=fullRows.length+' รายการ';
 $('fullPage').textContent='หน้า '+(fullPage+1)+' / '+pages;$('fullPrev').disabled=fullPage===0;$('fullNext').disabled=fullPage>=pages-1;
}
$('fullPrev').onclick=()=>{fullPage--;drawFullOverview()};$('fullNext').onclick=()=>{fullPage++;drawFullOverview()};

var officeChartPage=0;
const OFFICE_CATEGORIES=['HB_2','HB_3','JA_2','JA_3','M4_2','M4_3'];
const OFFICE_COLORS=['#74045f','#ad6ca4','#2563eb','#6b9bed','#c17d13','#e4b95b'];
function renderOfficeChart(){
 const groups=new Map();
 fullRows.forEach(r=>{const office=r.office||'ไม่ระบุการไฟฟ้า',category=String(r.group||'').split(' ')[0];if(!groups.has(office))groups.set(office,{});const counts=groups.get(office);counts[category]=(counts[category]||0)+1;});
 const rows=[...groups].map(([name,counts])=>({name,counts,total:Object.values(counts).reduce((a,b)=>a+b,0)})).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name,'th'));
 const categories=[...OFFICE_CATEGORIES,...new Set(fullRows.map(r=>String(r.group||'').split(' ')[0]).filter(c=>!OFFICE_CATEGORIES.includes(c)))].filter(c=>rows.some(r=>r.counts[c]));
 const label=c=>c.replace('_2','.2000').replace('_3','.3000');
 const color=c=>OFFICE_COLORS[OFFICE_CATEGORIES.indexOf(c)]||'#777';
 const pages=Math.max(1,Math.ceil(rows.length/5));officeChartPage=Math.min(officeChartPage,pages-1);
 const max=Math.max(1,...rows.map(r=>r.total));
 $('officeChartLegend').innerHTML=categories.map(c=>'<span><i style="background:'+color(c)+'"></i>'+esc(label(c))+'</span>').join('');
 $('officeChartBars').innerHTML=rows.slice(officeChartPage*5,officeChartPage*5+5).map(r=>'<div class="office-chart-row"><span>'+esc(r.name)+'</span><div class="office-chart-track" role="img" aria-label="'+esc(r.name+' รวม '+r.total+' งาน; '+categories.filter(c=>r.counts[c]).map(c=>label(c)+' '+r.counts[c]+' งาน').join(', '))+'">'+categories.filter(c=>r.counts[c]).map(c=>'<div title="'+esc(label(c)+': '+r.counts[c]+' งาน')+'" style="height:'+r.counts[c]/max*100+'%;background:'+color(c)+'"><span>'+r.counts[c]+'</span></div>').join('')+'</div><b>'+r.total+'</b></div>').join('')||'<p class="muted">ไม่พบข้อมูลตามตัวกรอง</p>';
 $('officeChartSummary').textContent=fullRows.length+' งาน · '+rows.length+' การไฟฟ้า · หน่วย: งาน';
 $('officeChartPage').textContent='หน้า '+(officeChartPage+1)+' / '+pages;
 $('officeChartPrev').disabled=officeChartPage===0;$('officeChartNext').disabled=officeChartPage>=pages-1;
}
$('officeChartPrev').onclick=()=>{officeChartPage--;renderOfficeChart()};
$('officeChartNext').onclick=()=>{officeChartPage++;renderOfficeChart()};
