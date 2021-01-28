import './style.css';
import audiofile from "../resources/alarmsound.wav";
import flatpickr from 'flatpickr/dist/flatpickr.min';
import test from "../resources/test.json";

var timer;                                   //자동 초세기
var ringBell ={};
ringBell.currentTime = new Date().getTime(); //기준시간 (milliseconds)
var alarm ={                                 //사용자가 설정한 알람 
    setTime:"",                              //알람시간 
    clockMode:"",                            //시계모드
    alarmMode:"",                            //알람모드
    alarmMemo:"",                            //알람메모 
    alertType:"",                            //알림타입 
    alarmAvaliable:""                       //알림끄기버튼 활성화에 따른 상태값
}
ringBell.alarmList=new Array(alarm);         //알람 리스트
ringBell.div = window.document.getElementById("div_ringBell");
var ringdiv = ringBell.div;
/* 알람 울릴때 필요한 리소스 변수 */
var audio = new Audio(audiofile);

function init(){

    /*값 변경을 위한 돔 영역*/
        var ctChangarea = ringdiv.querySelector(".currentTime");          //기준 시간 영역
        var ctChange = ringdiv.querySelector(".nowtime");                 //기준 시간 값 영역
        var dateSelector = ringdiv.querySelector("#dateSelector");        //알람 시간 설정 영역
        var insertAlarmArea = ringdiv.querySelector("#setAlarm");         //알람 추가 영역
        var insertTestCase = ringdiv.querySelector("#setTest");           //테스트 케이스 입력 
        var alarmForm = document.insertAlarm;                             //알람 입력값 받기
        var btnarea = ringdiv.querySelector(".listTitle");                //알람 리스트 노출 영역
        var area = ringdiv.querySelector(".alarmList");  
        var alertArea = ringdiv.querySelector('.over');

    /*필요한 임시 변수값 */
        var settedTime;   //설정된 알람 값  (milliseconds)

    /*기준 시간 영역 */
        //flatpickr 실행 하여 기준 시간 변동 가능하도록 구현
        flatpickr(ctChange,{
            defaultDate: new Date(),
            enableTime:true,
            time_24hr:true,
            dateFormat: "Y년m월d일 H:i",
            onChange: function(selectedDates) {
                ringBell.currentTime= selectedDates[0].getTime();
                clearInterval(timer);
                countTime(ringBell.currentTime,ctChange);
            }
        });
        
        //초마다 기준 시간 변경하기 
        countTime(ringBell.currentTime,ctChange);

        //기준 시간을 현재 시간으로 변경
        ctChangarea.onclick= function(e){
            e.preventDefault();
            ringBell.currentTime= new Date().getTime();
            clearInterval(timer);
            countTime(ringBell.currentTime,ctChange);
        }

    /*알람 설정 영역 */
        //알람 시간 설정하기 
        flatpickr(dateSelector,{
            enableTime:true,
            time_24hr:true,
            dateFormat: "Y년m월d일 H:i",
            onChange: function(selectedDates) {
                ringBell.setTime=selectedDates[0];
                settedTime= selectedDates[0].getTime();
            }
        });    

        //설정된 알람 누락값 확인 후 리스트에 추가 
        insertAlarmArea.onclick= function(e){
            e.preventDefault();
            if(checkDuplicateAlarm(settedTime,-1)){
                addAlarm(alarmForm, settedTime);
            }
            alarmForm.clockMode.value = '일반';
            alarmForm.alarmMode.value = '일반';
            alarmForm.memo.value = '';
            alarmForm.dateSelector.value ='';
            settedTime = '';
        }

        //테스트 케이스 입력 
        insertTestCase.onclick= function(e){
            e.preventDefault();
            insertTestAlarmList();
        }
        
    /*알람 리스트 영역 */
        getAlarmList();

        btnarea.onclick= function(e){
            e.preventDefault();
            deleteAll();
        }

        area.onclick= function(e){
            e.preventDefault();
            var target = e.target.id;
            var targetName = target.substr(0,7);
            var targetindex = target.substr(7,target.length);

            if( targetName == 'stopbtn'){
                stopAlarm(targetindex);
            }else{
                deleteAlarm(targetindex);
            }
        }

    /*알람 울리는 영역 */
        alertArea.onclick= function(e){
            e.preventDefault();
            ringingStop();
        }
}


//시간을 원하는 포맷으로 변경 하기 
function getCurrentTime(time){

    var date;
    //설정 값이 현재 시간과 같을때 구분
    date = new Date(time);
    var year = date.getFullYear();
    var month = date.getMonth()+1 <10 ? '0'+ (date.getMonth()+1):date.getMonth()+1;
    var dates = date.getDate() <10 ? '0'+ date.getDate():date.getDate();
    var hours = date.getHours() <10 ? '0'+ date.getHours():date.getHours();
    var minutes = date.getMinutes() <10 ? '0'+ date.getMinutes():date.getMinutes();
    var seconds = date.getSeconds() <10 ? '0'+ date.getSeconds():date.getSeconds();

    date= year+'년'+month+'월'+dates+'일 '+hours+':'+minutes+':'+seconds;

    return date;
}

//알람 울리기 
function ringingAlarm(index){
    var type = ringBell.alarmList[index].alertType;
    var alertArea = ringdiv.querySelector('.over');
    var classname = 'over off';
    if(type == '소리'){
        audio.play();
        classname = 'over sound';
    }else{
        classname = 'over vibrate';
    }

    alertArea.setAttribute('class', classname);
    alertArea.innerHTML='<button class=btn id=ringingStopBtn >알람 종료</button>';
    
    setTimeout(function (){
        if(alertArea.getAttribute('class') != 'over off'){
            ringingStop();
        }
    }, 10000);
}

//알람 종료 
function ringingStop(){
    var alertArea = ringdiv.querySelector('.over');
    if(audio.currentTime != 0){
        audio.pause();
        audio.currentTime = 0;
    };
    alertArea.setAttribute('class', 'over off');
    alertArea.innerHTML='';
}

//알람 리스트 내에 울릴 알람 있는지 확인 
function checkAlarmRing(value){
    if(ringBell.alarmList[0].setTime !=''){
        var check;
          //check= ringBell.alarmList.map(function(alarm){Math.floor(alarm.setTime/1000)}).indexOf(Math.floor(value/1000));
            check = ringBell.alarmList.findIndex(function(alarm){return Math.floor(alarm.setTime/1000) == Math.floor(value/1000)});
        if(check != -1){
            if(ringBell.alarmList[check].alarmAvaliable){
                stopAlarm(check);
                if(ringBell.alarmList[check].alertType != "무음"){
                    ringingAlarm(check);
                }
            }
        }
    }

}

//초세기 함수 
function countTime(value, ctarea){
    
    ctarea.innerText = getCurrentTime(value);

    timer= setInterval(function (){
        value += 1000;
        ctarea.innerText = getCurrentTime(value);
        checkAlarmRing(value);
    },1000);
}

//알림 타입 설정 
function checkType(cMode, aMode){
    var type = "소리";
    if(cMode == "진동"){
        type = "진동";
    }else if(cMode == "야간" && aMode == "일반"){
        type = "무음";
    }
    return type;
}

//알람 리스트에 추가 전에 중복 알람 있는지 확인 
function checkDuplicateAlarm(time,index){
    if(time){
        var check;
        //  check= ringBell.alarmList.map(function (alarm){return Math.floor(alarm.setTime/1000)}).indexOf(Math.floor(time/1000));
            check = ringBell.alarmList.findIndex(function(alarm) { return Math.floor(alarm.setTime/1000) == Math.floor(time/1000) &&  alarm.alarmAvaliable == true});
        if(check == -1  || check == index){
            return true;
        }else{
            alert('같은 시간에 중복된 알람이 있습니다.');
        }
    }else{ 
        alert('알람 시간을 설정해주세요');
    }
    return false;
}

//알람 리스트에 추가
function addAlarm(alarmForm,time){
    var setting; 
    setting ={
        setTime:time,                             
        clockMode:alarmForm.clockMode.value,                            
        alarmMode:alarmForm.alarmMode.value,                            
        alarmMemo:alarmForm.memo.value,
        alertType: checkType(alarmForm.clockMode.value,alarmForm.alarmMode.value), 
        alarmAvaliable: true
    }
    
    if(ringBell.alarmList[0].setTime !=''){
        ringBell.alarmList.push(setting);
    }else{
        ringBell.alarmList[0]=setting;
    }
    
    ringBell.alarmList.sort(function(a, b){ return a.setTime - b.setTime});

    getAlarmList();
}

//알람 끄기 기능 
function stopAlarm(index){
    if(checkDuplicateAlarm(ringBell.alarmList[index].setTime,index)){
        var selectedAlarm = ringdiv.querySelector("#item"+index); 
        var btnArea = ringdiv.querySelector("#stopbtn"+index); 
        //해당 알람 상태 변경
        var state = !ringBell.alarmList[index].alarmAvaliable;
        ringBell.alarmList[index].alarmAvaliable=state;

        var classname =  state ? 'alarmOn':'alarmOff';
        var name =  state ? '끄기':'켜기';

        //상태에 따라 알람 텍스트 css 변경 및 버튼 명 변경
        selectedAlarm.setAttribute('class',classname);
        btnArea.innerText  = name;
    }
}

//알람 삭제 기능
function deleteAlarm(index){
    if(ringBell.alarmList.length == 1){
        ringBell.alarmList[0]=alarm;
    }else{
        ringBell.alarmList.splice(index,1);
    }

    getAlarmList(); 
}

//알람 전체 삭제 기능
function deleteAll(){
    //초기화 해준 후 삭제 
    ringBell.alarmList[0]=alarm;
    ringBell.alarmList.splice(1,ringBell.alarmList.length);
    getAlarmList(); 
}


//알람 리스트 노출 
function getAlarmList(){
    var btnarea = ringdiv.querySelector(".listTitle");          //알람 리스트 노출 영역
    var area = ringdiv.querySelector(".alarmList");  


    area.innerHTML ='';
    btnarea.innerHTML = '<h1 class= "listTitle">알람 리스트</h1>';
    if(ringBell.alarmList[0].setTime !=''){
        btnarea.innerHTML +='<button class=delallbtn>전체 알람 삭제</button>';
        ringBell.alarmList.forEach(function(alarm,index){
            area.innerHTML += '<li class='+(alarm.alarmAvaliable? 'alarmOn':'alarmOff')+' id=item'+index+'><div class=listformat><span>'
            +getCurrentTime(alarm.setTime).substring(0,17)+'</span>'
            +'  '+alarm.clockMode+'  '+alarm.alarmMode+'   '
            +'<button id=delebtn'+index+'>삭제</button><button id=stopbtn'+index+'>끄기</button></div><div class=listformat>'
            +alarm.alarmMemo+''+'</li></div>';
        });
    }else{
        area.innerHTML =  '<li>등록된 알람이 없습니다.</li>';
    }   
}

//테스트 알람 리스트 입력하기 
function insertTestAlarmList(){
    ringBell.alarmList = Object.values(test);
    getAlarmList();
}

//초기 값 세팅 함수 실행
init();



