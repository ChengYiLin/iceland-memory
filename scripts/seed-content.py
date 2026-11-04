from pathlib import Path
import re,json,sys
# content/journey.json is edited by hand after seeding; regenerating from the itinerary discards those edits.
if Path('content/journey.json').exists() and '--force' not in sys.argv:
 sys.exit('content/journey.json already exists and holds hand-edited text. Pass --force to overwrite it from docs/itinerary.md.')
text=Path('docs/itinerary.md').read_text()
parts=re.split(r'^## Day (\d+)（(\d\d/\d\d)）｜(.+)$',text,flags=re.M)
regions=[('reykjavik','雷克雅維克',[-21.94,64.15]),('snaefellsnes','斯奈山半島',[-23.2,64.85]),('northwest','西北部',[-20.3,65.55]),('akureyri','阿庫雷里',[-18.09,65.68]),('myvatn','米湖與北部',[-16.99,65.62]),('east','東部峽灣',[-14.2,65.05]),('southeast','東南岸',[-15.5,64.2]),('south','南岸',[-19.1,63.55]),('golden','黃金圈',[-20.5,64.3])]
day_regions={1:[],2:['reykjavik'],3:['snaefellsnes'],4:['snaefellsnes','northwest'],5:['northwest','akureyri'],6:['akureyri','myvatn'],7:['myvatn'],8:['myvatn'],9:['east'],10:['east'],11:['east','southeast'],12:['southeast'],13:['southeast','south'],14:['south','reykjavik'],15:['reykjavik'],16:['golden','reykjavik'],17:['reykjavik'],18:[]}
days=[]
for i in range(1,len(parts),4):
 n,date,title,body=parts[i:i+4]; n=int(n); body=body.split('\n## ')[0]
 memories=[]; notes=[]
 for line in body.splitlines():
  m=re.match(r'^\s*(?:- |\d+\. )(.+)$',line)
  if not m:continue
  item=m.group(1)
  if item.startswith('行程更正：'): continue
  if item.endswith(('：','依提供順序：','依提供順序：')):continue
  if '徒步路線，依提供順序' in item:continue
  expanded=[item]
  if item.startswith('早晨補拍：'):
   expanded=['傑古沙龍冰河湖（Jökulsárlón）：補拍昨日跳過的冰河湖。','鑽石黑沙灘（Diamond Beach）：早晨前往拍照。','Fjallsárlón 小冰河湖：欣賞靜謐的小冰河湖。']
  elif item.startswith('93 號公路隘口：'):
   expanded=['93 號公路隘口：原紀錄為《白日夢冒險王》滑板公路。','Gufufoss 瀑布：行經 93 號公路時沿途停靠。']
  elif item.startswith('霍夫索斯（Hofsós）：'):
   expanded=['霍夫索斯藍色教堂：造訪 Hofsós 的藍色教堂。','霍夫索斯海景泳池：欣賞面朝峽灣的無邊際溫泉泳池，是否入池待旅人補充。']
  elif item.startswith('漫步彩虹步道與淡藍色小教堂'):
   expanded=['彩虹步道：漫步 Seyðisfjörður 的彩虹街道。','淡藍色小教堂：造訪 Seyðisfjörður 的教堂。']
  for item in expanded:
   title_=item.split('：',1)[0]
   if len(title_)<5 and '：' in item:title_=item.split('：',1)[1].split('，')[0]
   if len(title_)>30:title_=title_[:28]+'…'
   flight=n in [1,18] or item.startswith(('回程：','護照事件：'))
   memories.append(dict(id=f'day-{n:02}-memory-{len(memories)+1:02}',title=title_,locationName='航程與返家' if flight else item.split('：',1)[0],coordinate=None,locationStatus='flight' if flight else 'pending',story=item,remarks='',photos=[]))
 days.append(dict(id=f'day-{n:02}',number=n,date='2026/'+date,title=title,summary=title.replace('・','，'),regionIds=day_regions[n],notes=notes,memories=memories))
data=dict(schemaVersion=1,title='冰島，沿途的我們',totalDays=18,regions=[dict(id=i,title=t,anchor=c) for i,t,c in regions],days=days)
# Preserve previously researched POI references when the source memory text is unchanged.
previous_path=Path('content/journey.json')
if previous_path.exists():
 previous=json.loads(previous_path.read_text())
 prior={m['id']:m for d in previous['days'] for m in d['memories']}
 for day in data['days']:
  for memory in day['memories']:
   old=prior.get(memory['id'],{})
   if old.get('coordinateSource') and old.get('story')==memory['story']:
    for key in ['coordinate','coordinateSource','locationStatus']:
     memory[key]=old[key]
Path('content/journey.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
Path('public/journey.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(len(days),'days',sum(len(d['memories']) for d in days),'memories; previously verified POI references preserved, unknown positions remain pending.')
