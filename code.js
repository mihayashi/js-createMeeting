function doPost(e) {
  Logger.log(e);
  let postdata = JSON.parse(e.postData.getDataAsString());
//  console.log('postdata:',postdata);
//  console.log('postdata type:',typeof postdata);
//  console.log('postdata.sdate type:',typeof postdata.sdate);
//  console.log('postdata.sdate:',postdata.sdate);
//  console.log('postdata.stime type:',typeof postdata.stime);
//  console.log('postdata stime',postdata.stime);
//  console.log('postdata.duration type:',typeof postdata.duration);
//  console.log('postdata duration',postdata.duration);
//  console.log('postdata.stime type:',typeof postdata.stime);
//  console.log('postdata title',postdata.title);

  let sdate = postdata.sdate;
  let stime = postdata.stime;
  let duration = postdata.duration;
  let title = postdata.title;
  let calendarID = postdata.calendarID;
  let room = postdata.zoomRoom;
  console.log('sdate:',sdate);
  console.log('stime:',stime);
  console.log('duration:',duration);
  console.log('title:',title);
  console.log('calendarID:',calendarID);
  console.log('room:',room);
  let start_time = sdate +'T'+stime+':00';
  console.log('start_time:',start_time);
  
  
  
  //zoomアカウント取得
  let mySheet = SpreadsheetApp.openById('xxxxxxxx').getSheetByName('list');
  let arrData = mySheet.getDataRange().getValues();
  
  let _ = Underscore.load();
  let arrTrans = _.zip.apply(_, arrData);
  let rowNum = arrTrans[2].indexOf(calendarID)+1;
  let mail = mySheet.getRange(rowNum, 2).getValue();   //スプレッドシートの指定行の2列目
  console.log('mail :'+ mail);

  
  
  
  //create Zoom Meeting
  const secret = 'xxxx';
  let jwtToken = encodeJWT(secret);
  
//  mail = 'xxx@mail.com';
  let zoomurl = 'https://api.zoom.us/v2/users/'+mail+'/meetings';
  let password = generatePass();
  console.log('password: '+password);
  let response = UrlFetchApp.fetch(zoomurl, {
  'method' : 'post',
  'contentType': 'application/json',
  'payload' : JSON.stringify({
    'topic': title,
    'type': 2,
    'start_time': start_time,
    'duration': duration,
    "timezone": "Asia/Tokyo",
    "password": password,
    "settings":  {
    "host_video": false,
    "participant_video": false,
    "join_before_host": true,
    "waiting_room": true,
    "meeting_authentication": true
  }

  }),
  'headers': {
   'Authorization': 'Bearer '+jwtToken
  }
});
  Logger.log('response:',response);
  let json = JSON.parse(response.getContentText());
  let join_url = json.join_url;
  let zoom_id = json.id;
  let pass = json.password;
  let description = Utilities.formatString('<div>----------------------------------------------------</div><div>zoom_room: %s</div><div>zoom_link: %s</div><div>zoom_id: %s</div><div>pass: %s</div><div>----------------------------------------------------</div>', room, join_url, zoom_id, pass);
  //let description = Utilities.formatString('zoom_link: %s<br>zoom_id: %s', join_url, zoom_id);

  let output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(JSON.stringify( { sucsess: true, description:description }));
  return output;
  
}

function generatePass() {
  let LENGTH = 10; //生成したい文字列の長さ
  let SOURCE = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
    '!"#$%&()=~|@[];:+-*?_.,\''
  ]
  let OFFSET = SOURCE.length-1;
  let randomConfig = []; //ランダム設定配列
  let sum = 0;
  let result = '';

  //どのSOURCEを何文字含むかをランダムで設定
  for(let i=0; i<=OFFSET; i++){
    let includeNum = (i === OFFSET)
      ? LENGTH - sum
      : 1 + Math.floor(Math.random() * (LENGTH - OFFSET - sum - i + 2));

    randomConfig.push({
      src: SOURCE[i], //元になるSOURCE
      includeNum: includeNum, //含む回数
      count: 0 //含まれた回数
    });
    sum += includeNum;
  }

  //指定した長さのランダムな文字列を生成
  for(let i=0; i<LENGTH; i++){
    let index = 1 + Math.floor(Math.random() * randomConfig.length-1);
    let randomSource = randomConfig[index];

    //ランダムなSOURCEから文字を選んで結合
    result += randomSource.src[Math.floor(Math.random() * randomSource.src.length)];

    randomSource.count++;

    //countとincludeNumが一致したらrandomConfig配列から削除
    if(randomSource.count === randomSource.includeNum){
      randomConfig.splice(index, 1)
    }
  }

  return result;
  /*
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  text = ""; //Reset text to empty string

  for(let i=0;i<10;i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
  */
}

function base64Encode(str){
  let encoded = Utilities.base64EncodeWebSafe(str);
    // Remove padding
    return encoded.replace(/=+$/, '');
}

function encodeJWT(secret) {
    let header = JSON.stringify({
        typ: 'JWT',
        alg: 'HS256'
    });
    let encodedHeader = base64Encode(header);
    let payload = JSON.stringify({
        iss: 'oYhAwYvDRQC1I6_N4F2Ayw',
        exp: Math.floor((new Date().getTime()+10000) / 1000)
    });
    
    let encodedPayload = base64Encode(payload);
    let toSign = [encodedHeader, encodedPayload].join('.');
    let signature = Utilities.computeHmacSha256Signature(toSign, secret);
    let encodedSignature = base64Encode(signature);
    return [toSign, encodedSignature].join('.');
}
