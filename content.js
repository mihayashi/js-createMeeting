chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
    if(request == "Action"){
        createSchedule();
    }
});
function createSchedule(){

    try {
        console.log('action');
        let startDateInput = document.getElementById('xStDaIn');
        if (!startDateInput){
            throw new Error('スケジュール作成画面にて「タイトル」「開始・終了日時」「会議室」を入力の上押してください');
        }
        

        let startTimeInput = document.getElementById('xStTiIn');
        let endTimeInput = document.getElementById('xEnTiIn');
        let endDateInput = document.getElementById('xEnDaIn');
        let startDateCheck = startDateInput.dataset.initialValue;
        let startDate = startDateInput.dataset.date;
        let startTime = startTimeInput.dataset.initialValue;
        let endDateCheck = endDateInput.dataset.initialValue;
        let endDate = endDateInput.dataset.date;
        let endTime = endTimeInput.dataset.initialValue;
        let startDateFormat;
        let endDateFormat;
        let titleInput = document.getElementById('xTiIn');  //full screen
        let title;
        


        if(titleInput){
            title = titleInput.dataset.initialValue;            
        }else{
            alert('カレンダー上でダブルクリックまたは「作成」->「その他のオプション」でカレンダー作成画面を表示してください');
            return;
        }
        if(title){
            console.log('title:',title);
        }else{
            console.log('title is null');
            alert('タイトルを入力してください');
            return;
        }
        

        if(isDate(startDateCheck)){
            startDateFormat = (startDate.substr(0, 4) + '-' + startDate.substr(4, 2) + '-' + startDate.substr(6, 2));
            console.log('startDateFormat:',startDateFormat);
        }else{
            console.log('startDate is not datetype');
            alert('開始日をカレンダーより入力してください');
            return;
        }
        if(isTime(startTime)){
            console.log('startTime:',startTime);
        }else{
            console.log("startTime is not time");
            alert('開始時刻を正しく入力してください');
            return;
        }
        if(isDate(endDateCheck)){
            endDateFormat = (endDate.substr(0, 4) + '-' + endDate.substr(4, 2) + '-' + endDate.substr(6, 2));
            console.log('endDateFormat:',endDateFormat);
        }else{
            console.log('endDate is not datetype');
            alert('終了日をカレンダーより入力してください');
            return;
        }
        if(isTime(endTime)){
            console.log('endTime:',endTime);
        }else{
            console.log("endTime is not time");
            alert('終了時刻を正しく入力してください');
            return;
        }
        
        let duration = getDuration(startDateFormat,startTime,endDateFormat,endTime);
        console.log('duration:',duration);
        if(duration > 0 && Number.isInteger(duration)){
            console.log('duration is valid');
        }else{
            console.log('duration is invalid');
            alert('開始終了を正しく入力してください');
            return;
        }
        
        
        let roomList = $('#xRmLst > div > div');
        if(roomList.length == 0){
            console.log('room is not selected');
            alert('会議室を選択してください');
            return;
        }

        let room = roomList[0];
        let zoomRoom = room.getAttribute('aria-label');
        console.log('zoomRoom:',zoomRoom);
        let calendarID = room.dataset.email;
        console.log('calendarID:',calendarID);

        // return;

        
        post2GAS(startDateFormat,startTime,duration,title,calendarID,zoomRoom);





        
    } catch (e) {
        alert(e);
    }
    
}

//日付形式チェック
function isDate(date){

    if(/^20[0-9]{2}年 ([1-9]|1[0-2])月 ([1-9]|[12][0-9]|3[01])日$/.test(date)){
        return true;
    }else{
        return false;
    }
}

//時間形式チェック
function isTime(time){
    if(/^[0-2][0-9]:[0-5][0-9]$/.test(time)){
        return true;
    }else{
        return false;
    }

}

//会議時間計算
function getDuration(sdate,stime,edate,etime){
    let s = sdate+" "+stime;
    let e = edate+" "+etime;
    let st = new Date(s);
    let et = new Date(e);
    let diffTime = et.getTime() - st.getTime();
    let d = Math.floor(diffTime/(1000*60));
    return d;

}

//zoomスケジュール作成
function post2GAS(sdate,stime,duration,title,calendarID,zoomRoom){
    const gasurl = 'gas.txt';

    const data = {
        sdate: sdate,
        stime: stime,
        duration: duration,
        title: title,
        calendarID: calendarID,
        zoomRoom: zoomRoom
    }
    let jsondata = JSON.stringify(data);
    


    $.ajax({
        type: 'POST',
        url: gasurl,
        data: JSON.stringify(data)
    })
    .done(function(data){
        console.log('success');
        // console.log(data);
        let zoomInfo = data.description;
        console.log('zoomInfo:',zoomInfo);
        
        let exp = $('.iSSROb.snByac')[0];
        exp.style.display = 'none';
        let textarea = $('.editable')[0];
        if(textarea.innerHTML == "<br>"){
            textarea.innerHTML = zoomInfo;
        }else{
            textarea.innerHTML = textarea.innerHTML + "<br>" + zoomInfo;

        }
        


    })
    .fail(function(jqXHR, textStatus, errorThrown){
        console.log('fail');
        console.log('XMLHttpRequest:',jqXHR.status);
        console.log('textStatus:',textStatus);
        console.log('errorThrown:',errorThrown);
    })
    .always((data)=>{
        console.log('process end');
    });


}
