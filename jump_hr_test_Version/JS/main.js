var game=new Game();

game.init();
game.addSucessFn(success);
game.addFailedFn(failed);

var mask=document.querySelector('.mask');
var restartButton=document.querySelector('.restart');
var score=document.querySelector('.score');

restartButton.addEventListener('click',restart);

//游戏重新开始，执行函数
function restart()
{
    mask.style.display='none';
    game.restart();
    autoJump.stopFun();// 重新开局时清一次定时器
	autoJump.clickTimes = 0;// 防止计时器timer1重复调用
}
//游戏失败执行函数
function failed()
{
    score.innerText=game.score;
    mask.style.display='flex';
    autoJump.stopFun();// 游戏失败时执行停止自动函数
	autoJump.clickTimes = 0;// 防止计时器timer1重复调用
}
//游戏成功执行函数
function success(score)
{
    var scoreCurrent=document.querySelector('.score-current');
    scoreCurrent.innerText=score;
    var tableSuccess=this.tableNum.length-2;
	// console.log(tableSuccess+'tableSuccessaaaaa');//成功跳的总台子
    if(tableSuccess<0){tableSuccess=0}
    if(tableSuccess==100){
    	$('#stopBtn').click();
    }
    // 测试模块
    if(autoJump.successProb>0.5){
    	autoJump.bFactor++;
    }
    var GRvalue = Math.sqrt(autoJump.bFactor)/tableSuccess;
    console.log(autoJump.bFactor+'bFactor',tableSuccess+'TruetableSuccess',GRvalue+'GRvalue',autoJump.successProb+'autoJump.successProb');
    // 测试模块
}


//***************************
//author: Hong Ri ***********
//date: 2019/8/20 ***********
//***************************


//下面代码块的目标是管理jumper自动跳台子，并可以选择对应的初始概率表示选手的水平

$(function(){
	autoJump.calculateTime();//页面加载时计算第一个到第二个台子的距离
	//控制表单框是否显示
	//显示
	$('#chooseProbBtn').click(function(){
		$('.fadeWrap').css({'display':'block'});
	})
	//隐藏
	$('#cancelBtn').click(function(){
		$('.fadeWrap').css({'display':'none'});
		$('#resetForm').click();
	})
	//点击确定按钮
	$('#confirmBtn').click(function(){
		//表单非空时，再去操作游戏
		if($('.porbForm').serializeArray().length != 0){
			//得到所选的值当做玩家水平
			autoJump.playerLevel = Number($('.porbForm').serializeArray()[0].value);
			// console.log(autoJump.playerLevel+'playerLevel');
			autoJump.calSuccessProb();// 选择水平之后有一个第一次跳跃成功的概率
			autoJump.calculateTime();//点击自动模拟后计算第一个到第二个台子的距离
			// 执行循环跳跃
			if(autoJump.clickTimes<2){ // 为了防止计时器timer1重复调用，所以加上了点击次数判断
				autoJump.timer2 = setInterval(function(){
					autoJump.jumpFun();
					autoJump.clickTimes++;
				},1000)
			}
			// 最后关闭并清空表单
			$('#cancelBtn').click();
		}
	})
	// 停止自动跳跃
	$('#stopBtn').click(function(){
		autoJump.stopFun();
		autoJump.clickTimes = 0;// 防止计时器timer1重复调用
	})
})
//循环跳跃逻辑
var autoJump = {
	timer1: null,
	timer2: null,
	playerLevel: null,
    successProb: null, //游戏成功的概率
	clickTimes: 0,
	jumpTime: 0,
	bFactor:0,
	calculateTime:function(){
		// console.log(autoJump.successProb+'aaaaaaaa');
        // 计算跳到下一个台子上需要按下鼠标的时间
        if(game.fallconfig.dir == 'left'){
            game.fallconfig.nextJumpTime = Math.abs(game.fallconfig.posNext)-Math.abs(game.jumper.position.x);
        }else{
            game.fallconfig.nextJumpTime = Math.abs(game.fallconfig.posNext)-Math.abs(game.jumper.position.z);
        }
        
        // console.log(game.fallconfig.nextJumpTime+'nextJumpTimedistance');
        // nextDistance为受玩家水平影响下的跳跃的真实距离
        // debugger;
        var nextDistance = game.fallconfig.nextJumpTime;
        // var nextDistance = Math.random()*(4/autoJump.successProb-1)+(game.fallconfig.nextJumpTime+0.5-(2/autoJump.successProb));
        // var a = game.fallconfig.nextJumpTime;
        // var p = autoJump.successProb;
        // var nextDistance = (Math.random()*((2/p+a-0.5)-(a-2/p+0.5)))+(a-2/p+0.5);
        // console.log(nextDistance);
        autoJump.jumpTime = 9.78046*Math.sqrt((nextDistance*(1000/60))/0.06);
        // console.log(autoJump.jumpTime+'time');
	},
	jumpFun: function(){
		game._handlemousedown();
		autoJump.timer1 = setTimeout(function(){
			clearTimeout(autoJump.timer1);
			game._handlemouseup();
		}, autoJump.jumpTime)
	},
	stopFun: function(){
		clearInterval(autoJump.timer2);
	},
	calSuccessProb: function(){//通过正态分布计算成功概率的函数
		var distribution={
			finalProb: 0,
			getNumberInNormalDistribution: function(mean,std_dev){
				var meanNum = Number(mean);
				return meanNum+distribution.uniformToNormalDistribution()*std_dev;
			},
			uniformToNormalDistribution: function(){
			    var sum=0.0;
			    for(var i=0; i<12; i++){
			        sum=sum+Math.random();
			    }
			    return sum-6.0;
			}
		}
		if(autoJump.playerLevel != null){
			distribution.finalProb = distribution.getNumberInNormalDistribution(autoJump.playerLevel,0.2);
			if(distribution.finalProb>1){
				distribution.finalProb = 1;
			}else if(distribution.finalProb<0){
				distribution.finalProb = 0.001;
			}
		}else{
			return;
		}
		autoJump.successProb = distribution.finalProb;
		// autoJump.successProb = Math.round(autoJump.successProb*100)/100;//对最后结果四舍五入
	}
}
