module.exports=(bot,options)=>{
	let loginTime;
	bot.on('spawn',()=>loginTime=new Date);
	bot.on('health',()=>{
		if(((new Date)-loginTime)<10000) return;
		if(bot.health>4) return;
		bot.chat("AFK session end, health is below 4. disconnecting!");
		console.log('Health too low, disconnecting!');
		bot.quit();
	})
}
