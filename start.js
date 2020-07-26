var mc = require('mineflayer');
var botConfig=JSON.parse(require('fs').readFileSync('config.json','utf8'))
if(botConfig.password=="") delete botConfig.password
botConfig.reconnectDelay=((botConfig.reconnectDelay.hours*60+botConfig.reconnectDelay.minutes)*60+botConfig.reconnectDelay.seconds)*1000//reconnectDelay in seconds
botConfig.maxTime=((botConfig.maxTime.hours*60+botConfig.maxTime.minutes)*60+botConfig.maxTime.seconds)*1000//leave time in seconds
if(botConfig.maxTime==0) botConfig.maxTime=Number.MAX_SAFE_INTEGER
console.log('maxTime:',botConfig.maxTime)
var mcData= require('minecraft-data')(botConfig.version)
var timeDone=0
var displayInterval;
var loginTime
var bot
var moveTimeout
function connect() {
	bot= mc.createBot(botConfig);
	bot.world="lobby"
	bot.on('spawn',()=>{
	if(bot.world=="afkWorld") return;
		bot.world="afkWorld"
		loginTime=new Date
		console.log('logged in!',loginTime.toTimeString());
		botConfig.messagesOnJoin.forEach(bot.chat);
	})
	moveTimeout=setTimeout(()=>{});
	bot.on('chat',(username,message)=>console.log((new Date).toTimeString(),'CHAT MESSAGE',username,':',message));
	bot.on('forcedMove',()=>{
		clearTimeout(moveTimeout)
		moveTimeout=setTimeout(()=>{
			if(botConfig.hopInMinecart) {
				minecarts=Object.values(bot.entities).filter(entity=>{
					distance=bot.entity.position.distanceTo(entity.position);
					console.log(entity.objectType,entity.position,distance);
					return entity.objectType=='Minecart' && distance<5
				})
				if(minecarts.length==0) console.log("NO MINECARTS FOUND!")
				else if(minecarts.length>1) console.log("MORE THAN 1 MINECART FOUND! NOT HOPPING IN!")
				else bot.mount(minecarts[0])
			}
			if(botConfig.activateButton) {
				button=bot.findBlock({matching:(block)=>block.name.includes('button')})
				if(!button) console.log("NO BUTTON FOUND!");
				else bot.activateBlock(button);
			}
			if(botConfig.activateLever) {
				lever=bot.findBlock({matching:block=>block.name=="lever"})
				if(!lever) console.log("NO LEVER FOUND!");
				else bot.activateBlock(lever);
			}
		},5000)
	})
	bot.on('health',()=>{
		if(((new Date)-loginTime)<10000) {
			console.log('HEALTH CHANGE, JUST JOINED');
			return
		}
		console.log("HEALTH CHANGED! ITS NOW",bot.health,"FOOD:",bot.food)
		if(bot.food<20) eat();
		if(bot.health>4) return;
		bot.chat("AFK session end, health is below 4. disconnecting!")
		botConfig.maxConnectAttempts=0;
		bot.quit()
	})
	bot.on('kicked',(reason,loggedIn)=>{
		console.log('GOT KICKED WHILE',loggedIn?'CONNECTED':'LOGGING IN',reason)
	})
	bot.on('end',()=>{
		clearInterval(displayInterval)
		endTime=new Date;
		millis=(endTime-loginTime);
        timeDone+=millis;
		console.log('START TIME:',loginTime.toTimeString(),'CURRENT TIME:',endTime.toTimeString(),'CONNECTED TIME:',logMillis(millis))
		botConfig.maxConnectAttempts--;
		if(botConfig.maxConnectAttempts<1) {
            console.log('TIME DONE:',logMillis(timeDone))
			console.log("NOT RECONNECTING, MAX REACHED!");
			return;
		}
		setTimeout(connect,botConfig.reconnectDelay)
	})
	bot.on('login',()=>{
		displayInterval=setInterval(()=>{
			console.log('---------------------------------');
			console.log('player:',bot.entity.position);
			console.log('vehicle:',bot.vehicle?bot.vehicle.position:null);
			console.log('health:',bot.health,'food:',bot.food);
			if(bot.food<20) eat();
			if((timeDone+(new Date-loginTime))<botConfig.maxTime) return;
			botConfig.maxConnectAttempts=0;
			bot.chat('End of AFK session, paid time ended!');
			bot.quit();
		},5000)
	})

}
connect();
function eat () {
	bot.equip(mcData.itemsByName.cooked_beef.id, 'hand', (err) => {
		if (err) {
			console.log("LOOKS LIKE I HAVE RUN OUT OF FOOD! err:",err,"health:",bot.health,"food level:",bot.food)
			return;
		}

		bot.consume(err=>console.log("CONSUME ERR:",err))
	})
}
function logMillis(millis) {
	seconds=Math.floor(millis/1000);
	minutes=Math.floor(seconds/60);
	hours=Math.floor(minutes/60);
	console.log('total seconds:',seconds,"total minutes:",minutes)
	minutes=Math.floor(minutes%60);
	seconds=Math.floor(seconds%60);
	formatted=hours+':'+minutes+':'+seconds;
	return formatted
}
process.on('SIGINT', function() {
	console.log("Caught interrupt signal");
	botConfig.maxConnectAttempts=0;
	bot.quit();
	setTimeout(process.exit,500);
})
