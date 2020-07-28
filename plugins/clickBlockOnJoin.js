module.exports=(bot,options)=>{
	moveTimeout=setTimeout(()=>{});
	bot.on('forcedMove',()=>{
		clearTimeout(moveTimeout)
		moveTimeout=setTimeout(()=>{
			if(options.exact) block=bot.findBlock({matching:block=>block.name==options.name})
			else block=bot.findBlock({matching:(block)=>block.name.includes(options.name)})
			if(!block) console.log("BLOCK NOT FOUND!");
			else bot.activateBlock(block);
		},5000)
	})
}
