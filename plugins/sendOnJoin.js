module.exports=(bot,options)=>{
	let switched=false;
	bot.on('spawn',()=>{
		if(switched) return;
		switched=true;
		options.messagesOnJoin.forEach(bot.chat);
	})
}
