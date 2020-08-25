const mc = require('mineflayer');
const fs=require('fs')
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
	loginTime=new Date
	bot= mc.createBot(botConfig);
	bot.mcData=mcData
	fs.readdir('./plugins', (err, files) => {
		if(err) {
			console.log("ERROR READING FILES!",err)
			process.exit();
		}
		bot.loadPlugins(files.map(name=>'./plugins/'+name).map(require))
	});
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
			if((timeDone+(new Date-loginTime))<botConfig.maxTime) return;
			botConfig.maxConnectAttempts=0;
			bot.chat('End of AFK session, paid time ended!');
			bot.quit();
		},5000)
	})
}
connect();
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

