function OS(){}
function App(){}


//System Config
const LOG_ERROR = "E";
const LOG_WARN = "W";
const LOG_INFO = "I";
OS.SCREEN_WIDTH = 48;
OS.SCREEN_HEIGHT = 27;
OS.whichEnvironment = "ModPE";
OS.screenPosition = null;
OS.screenBlock = 241;
OS.backgroundBlock = 123;
OS.screenBufferedArray = [];
OS.applicationArray = [];
OS.systemDir = _getBarnDir()+"/";
OS.animDir = OS.systemDir+"anim";
OS.fontDir = OS.systemDir+"fonts";
OS.appDir = OS.systemDir+"app";
OS.logDir = OS.systemDir+"log";
OS.logStr = "";

OS.running = false;
OS.currentFrameRate = 5;
OS.timer = {
	screen:0,
	value:0
};
OS.currentFrameCount = 0;
OS.currentCanvas = null;
OS.currentPaint = null;
OS.currentApp = null;
OS.cacheBitmap = android.graphics.BitmapFactory.decodeFile(OS.systemDir+"start_"+OS.SCREEN_WIDTH+".png").copy(android.graphics.Bitmap.Config.ARGB_8888, true);

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//System初始化
OS.init = function(){
	this._loadAnimation("start");
	this.currentCanvas = new Canvas(this.cacheBitmap);
	this.currentCanvas.drawARGB(255,255,255,255);
	this.currentPaint = new Paint();
	this.currentPaint.setARGB(255,0,0,0);
	this.currentPaint.setTypeface(android.graphics.Typeface.createFromFile(OS.fontDir+"/Mouse.otf"));
	this.currentPaint.setTextSize(8);
	this.running = true;
	
	this._loadApplication();
	
	
	this.log(LOG_INFO,"初始化完成")
}

function _getBarnDir(){
	if(OS.whichEnvironment=="ModPE"){
		return "/storage/emulated/0/PoloeOS";
	}
	else{
		return barnDir;
	}
}
//System图形界面绘制

OS.drawGui = function(){
	var canvas = this.currentCanvas;
	var paint = this.currentPaint;
	var attr = this.animAttr;
	canvas.drawARGB(255,255,255,255);
	if(this.currentApp!=null)
	this.currentApp.drawGui(canvas,paint);
}
//System键盘输入事件
OS.keyEvent = function(keyWord){
	if(keyWord=="Boot"){
		this.startApplication("Boot.js");
	}
	else{
		if(this.currentApp!=null)
		this.currentApp.keyEvent(keyWord);
		}
}

OS.startApplication = function(name){
	for(var i = 0;i<this.applicationArray.length;i++){
		if(this.applicationArray[i]==name){
			var code = this._readExternalTextFile(this.appDir+"/"+name);
			if(this.currentApp!=null)
			this.currentApp.end();
			this.currentApp = null;
			this.currentApp = getObject(code);
			this.currentApp.start();
			this.currentFrameRate = this.currentApp.frameRate;
			this.timer.screen = 0;
			this.timer.value = Math.round(20/this.currentFrameRate);
			this.log(LOG_INFO,this.currentApp.name+"已启动");
		}
	}
}

OS.getDataFromUrl = function(url,func){
	var thread = createThread(function(){
		var result = this.getDataFromUrl(url);
		func(result);
	});
	thread.start();
}

OS.log = function(type,info){
	var dateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	var time = dateFormat.format(new java.util.Date());
	this.logStr+=time+" "+type+" "+"OS "+info+"\n";
}

OS.shutdown = function(){
	var time = new java.text.SimpleDateFormat("HH:mm:ss MM-dd").format(new java.util.Date());
	this._saveExternalTextFile(this.logDir+"/log_"+time+".txt",this.logStr);
}

/*System内部方法*/
//加载动画
OS._loadAnimation = function(animName){
	var animLib = new java.io.File(this.animDir+"/"+animName);
	var animSet = animLib.listFiles();
	var animArray = [];
	for(var i =0;i<animSet.length;i++){
		var animImage = android.graphics.BitmapFactory.decodeFile(animSet[i].getPath());
		for(var y = this.SCREEN_HEIGHT-1;y>=0;y--){
			var single = [];
			for(var x = 0;x<this.SCREEN_WIDTH;x++){
				if(y<animImage.getHeight()&&x<animImage.getWidth()){
				
				single.push(animImage.getPixel(x,y));
				}else{
					single.push(android.graphics.Color.WHITE);
				}
			}
			this.screenBufferedArray.push(single);
		}
	}
}

OS._loadApplication = function(){
	var parentFile = new java.io.File(this.appDir);
	var appFileArray = parentFile.listFiles();
	for(var i = 0;i<appFileArray.length;i++){
		this.applicationArray.push(appFileArray[i].getName());
	}
}


OS._sendRequestToUrl = function(url){
	var url = new java.net.URL(url);
	var urlConnection = url.openConnection();
	var br = new java.io.BufferedReader(new java.io.InputStreamReader(urlConnection.getInputStream(),"utf-8"));
	
	var line = null;
	var sb = new java.lang.StringBuilder();
	while ((line = br.readLine()) != null)
	{
		sb.append(line+'\n');
	}
	br.close();
	result = sb.toString();
	return result;
}

OS._readExternalTextFile = function(fileName){
	var file = new java.io.File(fileName);
  var reader = null;
  var sbf = new java.lang.StringBuffer();
  try {
  	reader = new java.io.BufferedReader(new java.io.FileReader(file));
   var tempStr;
   while ((tempStr = reader.readLine()) != null) {
   		sbf.append(tempStr).append("\n");
   }
   reader.close();
   return sbf.toString();
   }catch (e){
   	this.log(LOG_ERROR,e.getMessage());

   }finally{
   		if (reader != null) {
   			try {
   				reader.close();
   			}catch(e1){
   				e1.printStackTrace();
      }
    }
  }
  return sbf.toString();
}

OS._saveExternalTextFile = function(path,content){
	var file = new java.io.File(path);
	file.createNewFile();
	var writer = null;//BufferedWriter;
	try{
		writer = new java.io.BufferedWriter(new java.io.FileWriter(file));
		writer.write(content);
		writer.close();
	}catch(e){
		this.log(LOG_ERROR,e.getMessage());
	}finally{
   		if (writer != null) {
   			try {
   				writer.close();
   			}catch(e1){
   				this.log(LOG_ERROR,e1.getMessage());
      }
    }
  }
}

OS.screenUpdate = function(){
	if(this.screenPosition!=null&&this.currentFrameCount<this.screenBufferedArray.length){
		var position = this.screenPosition;
		for(var i = 0;i<this.SCREEN_HEIGHT;i++)
		for(var j = 0;j<this.SCREEN_WIDTH;j++)
		setTile(position.x+j,position.y+i,position.z,this.screenBufferedArray[this.currentFrameCount+i][j]!=android.graphics.Color.WHITE?this.screenBlock:this.backgroundBlock);
	}
	this.currentFrameCount+=this.SCREEN_HEIGHT;
	if(this.currentFrameCount>this.screenBufferedArray.length){
		this.currentFrameCount = 0;
		
		this.screenBufferedArray = [];
	}
}

OS.setEnvironment = function(name){
	this.whichEnvironment = name;
}

/*App API*/
App.startApplication = function(name){
	OS.startApplication(name);
}

App.getDataFromUrl = function(url,func){
	OS.getDataFromUrl(url,func);
}

App.loadAnimation = function(name){
	OS._loadAnimation(name);
}

App.log = function(type,info){
	var dateFormat = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	var time = dateFormat.format(new java.util.Date());
	OS.logStr+=time+" "+type+" "+OS.currentApp.name+" "+info+"\n";
}

App.toast = function(text){
	clientMessage(text);
}

App.playSound = function(name,volume,rate){
	if(OS.whichEnvironment=="ModPE"&&name.split(".")[0]=="os"){
		return;
	}else{
	Level.playSound(getPlayerX(),getPlayerY(),getPlayerZ(),name,volume,rate);
	}
}

/*System底层实现*/
Block.defineBlock(240,"键盘响应单元", "iron_block",1,false,0);
Block.defineBlock(241,"仿制红石灯","redstone_lamp_on",1,false,0);
Player.addItemCreativeInv(240, 64, 0);
Player.addItemCreativeInv(241,64,0);
Block.setRedstoneConsumer(240,true);
//Block.setLightLevel(241,15);


function modTick(){
	if(OS.timer.screen==OS.timer.value){
		if(OS.running)
		OS.drawGui();
		for(var y = OS.SCREEN_HEIGHT-1;y>=0;y--){
			var single = [];
			for(var x = 0;x<OS.SCREEN_WIDTH;x++){
				single.push(OS.cacheBitmap.getPixel(x,y));
			}
			OS.screenBufferedArray.push(single);
		}
		OS.timer.screen = 0;	
		OS.screenUpdate();
	}
	OS.timer.screen++;
}

function redstoneUpdateHook(x, y, z, newCurrent, worldLoading, blockId, blockDamage){
	if(blockId==240&&newCurrent>=15){
		var str = Level.getSignText(x, y+1, z, 0);
		if(str!=null&&str!=""){
			OS.keyEvent(str);
		}
	}
}

function useItem(x,y,z,itemId,blockId){
	if(itemId==280){
		OS.screenPosition = new Position(x,y+1,z);
		OS.init();
	}
}

function leaveGame(){
	OS.shutdown();
}

/*
var read = new java.lang.Thread(new java.lang.Runnable({
	run:function(){
		myTick();
		read.sleep(25);
	}
}));
read.start();
*/

/*工具类*/
function Canvas(bitmap){return new android.graphics.Canvas(bitmap);}
function Paint(){return new android.graphics.Paint();}
function createThread(func){
	var thread = new java.lang.Thread(new java.lang.Runnable({
		run:function(){
			func();
		}
	}));
	return thread;
}
var Paint = android.graphics.Paint;
function getObject(data){
  return (new Function("return "+data))();
}
function Position(x,y,z){
	this.x = x;
	this.y = y;
	this.z = z;
}
