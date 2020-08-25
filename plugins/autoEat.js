module.exports=(bot,options)=>{
	let loginTime;
	bot.on('spawn',()=>loginTime=new Date);
	bot.on('health',()=>{
		if(((new Date)-loginTime)<10000) return;
		if(bot.food==20) return;
		bot.equip(bot.mcData.itemsByName.cooked_beef.id, 'hand', (err) => {
			if (err) {
				console.log("LOOKS LIKE I HAVE RUN OUT OF FOOD! err:",err,"health:",bot.health,"food level:",bot.food)
				return;
			}
			bot.consume(err=>console.log("CONSUME ERR:",err))
		})
	})
}
