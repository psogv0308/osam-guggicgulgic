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
			phrases: ["이건철", "기반체계운용대", "피엑스","80대대 지휘통제실","80대대 지통실","의무대","인트라넷계정"]
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
    callback("sound undetected");
  }
  else{
    Chatbot.chatbot(transcription,function(msg){
	  console.log(msg);
	  callback(msg);
    });
  }
}

var express = require('express');
var app = express();
var server = app.listen(3000, function(){
    console.log("Express server has started on port 3000")
})

var multer = require('multer');
var upload = multer({ dest: 'uploads/' })
app.get('/', function(req, res){
    res.send('Hello World');
});
app.post('/upload', upload.single('file'), function(req, res){
  main(req.file,function(msg){
	  res.send(msg);
  }).catch(console.error);
});