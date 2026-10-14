// Native popovers keep bubbles above the scrollable table. Click/tap and Escape
// work without this enhancement; JavaScript adds mouse hover, focus and placement.
const trainingPositions=new Map();
for (const trigger of document.querySelectorAll('[data-training-trigger]')) {
 const bubble=document.getElementById(trigger.getAttribute('popovertarget'));
 if(!bubble || !bubble.showPopover)continue;
 let timer;
 const cancel=()=>clearTimeout(timer);
 const place=()=>{
  if(!bubble.matches(':popover-open'))return;
  const rect=trigger.getBoundingClientRect(),box=bubble.getBoundingClientRect(),gap=8,pad=16;
  if(rect.bottom<0||rect.top>innerHeight){bubble.hidePopover();return;}
  const left=Math.max(pad,Math.min(rect.left,innerWidth-box.width-pad));
  const below=rect.bottom+gap;
  const top=below+box.height<=innerHeight-pad?below:Math.max(pad,rect.top-box.height-gap);
  bubble.style.left=`${left}px`;bubble.style.top=`${top}px`;
 };
 trainingPositions.set(bubble,place);
 const show=()=>{cancel();if(!bubble.matches(':popover-open'))bubble.showPopover();place();};
 const leave=()=>{cancel();timer=setTimeout(()=>{
  if(!trigger.matches(':hover,:focus')&&!bubble.matches(':hover'))bubble.hidePopover();
 },120);};
 trigger.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')show();});
 trigger.addEventListener('pointerleave',leave);
 trigger.addEventListener('focus',()=>{if(trigger.matches(':focus-visible'))show();});
 trigger.addEventListener('blur',leave);
 bubble.addEventListener('pointerenter',cancel);
 bubble.addEventListener('pointerleave',leave);
 bubble.addEventListener('toggle',()=>{
  trigger.setAttribute('aria-expanded',String(bubble.matches(':popover-open')));place();
 });

}

const placeTrainingPopovers=()=>{for(const [bubble,place] of trainingPositions)if(bubble.matches(':popover-open'))place();};
window.addEventListener('resize',placeTrainingPopovers);
window.addEventListener('scroll',placeTrainingPopovers,{passive:true});
