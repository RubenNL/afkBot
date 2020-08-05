module.exports=(bot,options)=>{
	let savedTPS=[]
	let interval=setInterval(()=>{},9999999)
	let nextMessage=false;
	bot.on('login',()=>{interval=setInterval(()=>bot.chat('/tps'),15*60*1000)})
	bot.on('message',message=>{
		if(!message.json) return;
		if(!message.json.extra) return;
		if(message.json.extra.length==0) return;
		message=message.json.extra.pop();
		if(!message) return;
		if(nextMessage) {
			if(!message.extra) return;
			if(!message.extra[8]) return;
			if(!message.extra[8].text) return;
			const currentTPS=parseFloat(message.extra[8].text)
			savedTPS.push(currentTPS)
			console.log('CURRENT TPS:',currentTPS)
			nextMessage=false;
		}
		if(message.text=="TPS from last 5s, 10s, 1m, 5m, 15m:") nextMessage=true;
	})
	bot.on('end',()=>{
		clearInterval(interval)
		console.log('AVERAGE TPS SINCE LAST JOIN:',savedTPS.reduce((a, b) => a + b, 0) / savedTPS.length);
	)
}
