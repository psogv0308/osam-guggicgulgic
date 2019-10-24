async function main(audio_file,callback) {
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');
  const fs = require('fs');
  const Chatbot = require('./Chatbot');
  // Creates a client
  const client = new speech.SpeechClient();

  // The name of the audio file to transcribe
  //const fileName = './audio_files/11_low.mp3';

  const fileName = './uploads/'+audio_file.filename;
  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(fileName);
  const audioBytes = file.toString('base64');

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: 'mp3',
    sampleRateHertz: 20000,
    languageCode: 'ko-KR',
	speechContexts: [
		{
			phrases: ["배차신청", "탄약","의무대","지통실","군의관","훈련","암구호","컴퓨터","프린터","국군대전병원","국군수도병원","직속상관","출장신청","어 난데","탄약 신청","개인신상","PX","사령관","자비스","전역일"]
		}
	]
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  var tr=transcription.replace(/\s/gi, "");
  //console.log(`${tr}`);
  if(tr == null || tr == '') {
	console.log("sound undetected");
    callback("Zzz","0. sound undetected");
  }
  else{
    Chatbot.chatbot(transcription,function(msg){
	  console.log(msg);
		//들리지 않았을때 예외처리
	  callback(transcription,msg);
    });
  }
}

var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var server = app.listen(3000, function(){
    console.log("Express server has started on port 3000")
})

var multer = require('multer');
var upload = multer({ dest: 'uploads/' })
var talk_data = ""
var swi = 1;
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.get('/', function(req, res){
    res.send('Hello World');
});
app.get('/app', (req, res) => {
	res.send(talk_data);
	console.log("ok");
});
app.get('/switch', (req, res) => {
	res.send("switch");
	swi=1-swi;
	console.log(swi);
});
app.post('/upload', upload.single('file'), function(req, res){
  main(req.file,function(tr, msg){
	  console.log(msg);
	  var str=msg.split(". ");
	  if(swi==0 && req.body.user=="1"){
		  res.send("Jarvis is turned off");
	  	  talk_data+=tr+"\nJarvis is turned off\n";
	  }
	  else if(req.body.user>=str[0]){
        res.send(str[1]);  
	    if(req.body.user=="1"){
	  	  talk_data+=tr+"\n"+str[1]+"\n";
	    }
	  }
	  else{
		if(req.body.user=="1") 
	  	  talk_data+=tr+"\npermission denied\n";
		res.send("permission denied")
	  }
  }).catch(console.error);
});