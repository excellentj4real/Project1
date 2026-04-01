'use strict';

/* NAV SCROLL */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('stuck',scrollY>60),{passive:true});
nav.classList.toggle('stuck',scrollY>60);

/* BURGER */
const burger=document.getElementById('burger'),mob=document.getElementById('mob');
burger.addEventListener('click',()=>{
  const o=mob.classList.toggle('open');
  burger.classList.toggle('open',o);
  burger.setAttribute('aria-expanded',String(o));
});
mob.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  mob.classList.remove('open');burger.classList.remove('open');burger.setAttribute('aria-expanded','false');
}));

/* SCROLL REVEAL */
const observer=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');observer.unobserve(e.target);}});
},{threshold:.1});
document.querySelectorAll('.rv,.rv-l,.rv-r').forEach((el,i)=>{
  if(el.closest('.feat-grid,.rev-grid,.gal-grid,.stats-band__inner,.delivery-band__inner')){
    el.style.transitionDelay=(i*.09)+'s';
  }
  observer.observe(el);
});

/* LIGHTBOX */
const lb=document.getElementById('lb'),lbImg=document.getElementById('lbImg'),lbX=document.getElementById('lbX');
document.querySelectorAll('.gi').forEach(gi=>{
  gi.addEventListener('click',()=>{
    lbImg.src='data:image/jpeg;base64,'+gi.dataset.b64;
    lbImg.alt=gi.dataset.alt||'Product image';
    lb.classList.add('open');document.body.style.overflow='hidden';
  });
});
const closeLB=()=>{lb.classList.remove('open');document.body.style.overflow='';};
lbX.addEventListener('click',closeLB);
lb.addEventListener('click',e=>{if(e.target===lb)closeLB();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLB();});

/* FORM */
const oForm=document.getElementById('oForm'),oBtn=document.getElementById('oBtn'),oBtnTxt=document.getElementById('oBtnTxt');
const fmOk=document.getElementById('fmOk'),fmErr=document.getElementById('fmErr');
function validate(){
  if(!document.getElementById('fn').value.trim()){alert('Please enter your name.');return false;}
  if(!document.getElementById('fp').value.trim()){alert('Please enter your phone number.');return false;}
  if(!document.getElementById('fc').value){alert('Please select your country.');return false;}
  if(!document.getElementById('fa').value.trim()){alert('Please enter your delivery address.');return false;}
  return true;
}
oForm.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!validate())return;
  oBtn.disabled=true;oBtnTxt.textContent='Sending…';
  fmOk.className='fm';fmErr.className='fm';
  try{
    const r=await fetch(oForm.action,{method:'POST',body:new FormData(oForm),headers:{Accept:'application/json'}});
    if(r.ok){fmOk.className='fm ok';oForm.reset();oBtnTxt.textContent='Order Sent ✓';}
    else throw new Error();
  }catch{fmErr.className='fm er';oBtnTxt.textContent='Try Again';oBtn.disabled=false;}
});

/* YEAR */
document.getElementById('yr').textContent=new Date().getFullYear();