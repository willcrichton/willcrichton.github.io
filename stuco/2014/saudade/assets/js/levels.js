/**
 * This file describe different scenes
 */
//Loading Scene

var player;

Crafty.scene("Menu",function(){
    var toLoad = [];
    toLoad.push(game_path + "assets/img/loading.jpg", game_path + "assets/img/bg.png");
    for(var i in Crafty.assets){
        toLoad.push(i);
    }
    //Setup background image
    Crafty.background("url("+game_path+"assets/img/loading.jpg) black");
    
    //Select DOM elements
    var bar = $('#load');
    var button = $('#start');
    var skip = $('#skip');
    var text = bar.find('.text');
    
    $('#interface').hide();
    //Setup progressbar
    text.text("Loading ...");

    bar.progressbar({
        value:0
   
    });
    //Bind click event on button
    button.live('click',function(){
        //Start scene level 1
        Crafty.scene("Level1");  
    });
  
    skip.live('click',function(){
        bar.fadeOut(1000,function(){
            skip.hide();
            button.show();
        });
            
    });
    
    Crafty.load(toLoad,
        function() {
            //Everything is loaded
            bar.fadeOut(1000,function(){
                button.show();
            });
            
        },
        function(e) {
            var src = e.src ||"";
          
            //update progress
            text.text("Loading "+src.substr(src.lastIndexOf('/') + 1).toLowerCase()+" Loaded: "+~~e.percent+"%");
            bar.progressbar({
                value:~~e.percent
            });
       
      
        },
        function(e) {
            //uh oh, error loading
            var src = e.src ||"";
            console.log("Error on loading: "+src.substr(src.lastIndexOf('/') + 1).toLowerCase());
        }
        );
    //Crafty.audio.play("intro",-1);
},

//Uninit Scene
function(){
    Crafty.audio.stop();
    //Display loading interface
    $('#loading').hide();
});

//Level 1 Scene
Crafty.scene("Level1",function(){
    //Display interface
    $('#interface').show();
    //Setup background of level
    Crafty.background("url(" + game_path + "/assets/img/bg.png)");
    
    //$('.level').text('Level: 1');

    //Get the Interface elements
    var bars = {
        hp:$('#hp'),
    };
    bars.hp.addClass('green');
    
    var infos = {
        lives :$('.lives'),
        fireflies: $('.score'),
        hp:bars.hp.find('.text'),
        alert:$('.alert')
    }

        
    var createEnemies = function(frame){   
        
        if(frame % 40 == 0 && Crafty("Ghost").length < 1){
            Crafty.e("Ghost");   
        }
        if(frame % 50 == 0  && Crafty("Shade").length < 1){
            Crafty.e("Shade");
        }

        if(frame % 100 == 0  && Crafty("Beast").length < 1){
            Crafty.e("Beast");
        }

        if(frame % 300 == 0  && Crafty("Lvl1Boss").length < 1){
            Crafty.e("Lvl1Boss");
        }
    
    };
    //Create the player
    player = Crafty.e("Player");
    //Bind Gameloop to the Scene
    Crafty.bind("EnterFrame",function(frame){
        //Trigger Event to display enemies
        createEnemies(frame.frame);
        //Setup Background position
        Crafty.stage.elem.style.backgroundPosition ="0px "+frame.frame+"px";
        
    });
    
    //Bind UpdateStats Event
    Crafty.bind("UpdateStats",function(){
        //calculate percents
        player.hp.percent = Math.round(player.hp.current/player.hp.max * 100);
       
        //display the values
        infos.hp.text('HP: '+player.hp.current+ '/'+player.hp.max);
        infos.fireflies.text("Fireflies: "+player.fireflies);
        infos.lives.text("Lives: "+player.lives);
        
        //Update health
        bars.hp.progressbar({
            value:player.hp.percent
        });
        

    });
    //Bind global Event Show Text
    Crafty.bind("ShowText",function(text){
        infos.alert.text(text).show().effect('pulsate',500)
    });
    Crafty.bind("HideText",function(){
        infos.alert.text("").hide(); 
    });
    //Global Event for Game Over
    Crafty.bind("GameOver",function(score){
        Crafty.trigger("ShowText","Game Over!");
        //Crafty.audio.stop();
        //Crafty.audio.play("gameover",-1);
            
    });
    //Play background music and repeat
    //Crafty.audio.play("space",-1);
  
});


