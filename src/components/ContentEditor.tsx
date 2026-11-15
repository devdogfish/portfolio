import {useState} from 'react';
import {Button,Dialog,DialogTrigger,DialogContent,DialogTitle,DialogDescription,Input,Textarea} from '@atom63/ui-react';
import {Pencil,Download,Check} from 'lucide-react';
import {type PortfolioContent,defaultContent} from '../content';
export function ContentEditor({content,onChange}:{content:PortfolioContent,onChange:(c:PortfolioContent)=>boolean}){
 const [saved,setSaved]=useState<boolean|null>(null);
 function update(key:keyof PortfolioContent,value:string){setSaved(onChange({...content,[key]:value}))}
 function download(){const blob=new Blob([JSON.stringify(content,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='portfolio-content.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 return <Dialog><DialogTrigger render={<Button className="edit-launch" size="sm" variant="secondary"/>}><Pencil/>Edit content</DialogTrigger><DialogContent className="content-editor"><DialogTitle>Edit your portfolio</DialogTitle><DialogDescription>Changes save in this browser. Download your content as JSON to keep a copy.</DialogDescription><div className="editor-fields">{Object.entries(content).map(([key,value])=><label key={key}><span>{key.replace(/([A-Z])/g,' $1')}</span>{defaultContent[key as keyof PortfolioContent].length>100?<Textarea value={value} onChange={e=>update(key as keyof PortfolioContent,e.target.value)}/>:<Input value={value} onChange={e=>update(key as keyof PortfolioContent,e.target.value)}/>}</label>)}</div><div className="editor-actions"><Button onClick={download} variant="secondary"><Download/>Download content</Button>{saved!==null&&<span role="status">{saved?<><Check size={14}/> Saved</>:"Browser storage unavailable — download a copy"}</span>}<Button variant="ghost" onClick={()=>{if(confirm('Restore the original sample content?'))onChange(defaultContent)}}>Reset</Button></div></DialogContent></Dialog>
}
