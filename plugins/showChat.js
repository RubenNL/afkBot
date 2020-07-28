module.exports=(bot,options)=>{
	bot.on('chat',(username,message)=>console.log((new Date).toTimeString(),'CHAT MESSAGE',username,':',message));
}
