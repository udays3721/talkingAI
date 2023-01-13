import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form=document.querySelector('form');
const chat_container=document.querySelector('#chat_container');

let load_Interval;

function loader(element){
  element.textContent='';
  load_Interval=setInterval(()=>{
    element.textContent +='.';
    if(element.textContent ==="...."){
      element.textContent='';
    }
  },300)

}
function type_text(element,text){
  let index=0;
  let interval=setInterval(()=>{
    if (index< text.length){
      element.innerHTML +=text.charAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  },20)
}

function generateID(){
  const timestamp=Date.now();
  const random_number=Math.random();
  const hexToString= random_number.toString(16);
  return `id-${timestamp}-${hexToString}`;
  
}

function chat_stripe(isAi,value,uniqueID){
  return(
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class='chat'>
        <div class='profile'>
          <img
            src='${isAi ? bot:user}'
            alt='${isAi ? bot:user}'
          ></img>
        </div>
        <div class='message' id='${uniqueID}'>${value}</div>
      </div>
    </div>
    `
  )
}
const handle_submit=async(e)=>{
  e.preventDefault();
  const data=new FormData(form)
  //user's chatstripe
  chat_container.innerHTML +=chat_stripe(false,data.get('prompt'));
  form.reset();
  // bot's chatstripe
  const uniqueID=generateID()
  chat_container.innerHTML +=chat_stripe(true," ",uniqueID);
  chat_container.scrollTop = chat_container.scrollHeight;
  const msg_div=document.getElementById(uniqueID);
  loader(msg_div);

  //fetch data from server->get bot's response
  const reponse=  await fetch('https://talking-ai.onrender.com',{
    method:'POST',
    headers :{
      'Content-Type':'application/json'
    },
    body: JSON.stringify({prompt:data.get('prompt')})
  })

  clearInterval(load_Interval);
  msg_div.innerHTML='';
  if(Response.ok){
    const data=await Response.json();
    const parsedData= data.bot.trim();
    type_text(msg_div,parsedData);
  }else{
    const err=await Response.text();
    msg_div.innerHTML="Something went wrong";
    alert(err);
  }

}
form.addEventListener('submit',handle_submit);
form.addEventListener('keyup',(e)=>{
  if(e.keyCode===13){
    handle_submit(e);
  }
})
