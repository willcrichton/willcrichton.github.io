var drops = ["Heal", "Fireflies"]

Crafty.c("Enemy",{
    playerID:null, //ID of player which has something todo with that enemy
    init:function(){
        //All enemies will get same basic components
        this.requires("2D,Canvas,Collision")  
        //Destroy all enemies if they leave the viewport
        .bind("EnterFrame",function(){
            if(this.x > Crafty.viewport.width + this.w ||
                this.x < -this.w || 
                this.y < -this.h || 
                this.y > Crafty.viewport.height +this.h){
                this.destroy();
            }
        })
        //Describe behavior on getting hitted by Player Bullet
        .onHit("PlayerBullet",function(ent){
            var bullet = ent[0].obj;
            this.playerID = bullet.playerID; //Which player hurted you
            this.trigger("Hurt",bullet.dmg); //Hurt the enemy with bullet damage
            bullet.destroy(); //Destroy the bullet
        })
        //Describe behavior on getting hit by Player
        .onHit("Player",function(ent){
            var player = ent[0].obj;
            // Hurt the player
            Crafty(player[0]).trigger("Hurt", this.hp);
            //Hurt enemy with all hp he has
            this.trigger("Hurt", this.hp);
        })
        //Event triggered when enemy was hurt
        .bind("Hurt",function(dmg){
            
            //Reduce HP
            this.hp -= dmg;
            //Die if hp is 0
            if(this.hp <= 0) this.trigger("Die");
        })
        .bind("Die",function(){
            
            //Destroy 
            this.destroy();
            if(Crafty.math.randomInt(0, 100) > 70){
                var drop = drops[Crafty.math.randomInt(0, drops.length-1)];
                Crafty.e(drop).attr({
                    x:this.x,
                    y:this.y
                });
            }
        });
    }
});



//Suicidal Beast
Crafty.c("Beast",{
    hp:10,
    init:function(){
        var player = Crafty("Player");
        var attacking = false;
        this.requires("Enemy,beast")
        .origin("center")
        .attr({
            rotation:0,
            y:-this.h,
            x:Crafty.math.randomInt(this.w,Crafty.viewport.width - this.w)
        })
        .bind("EnterFrame",function(){
            player = Crafty(player[0]);
            if(this.y < 0)
                this.y +=2;

            if(this.x < player.x && !attacking)
                this.x++;
            
            if(this.x > player.x && !attacking)
                this.x--;
        
            if(this.x == player.x)
                attacking = true;
                this.y +=5;
            
            if(attacking)
                this.y += 10;
        });

    }
});

// Shoots at you
Crafty.c("Shade",{
    hp:3,
    init:function(){
        var player = Crafty("Player");
        var x = 0;
        this.addComponent("Enemy","shade")
        .origin("center")
        .attr({
            rotation:0,
            y:-this.h,
            x:Crafty.math.randomInt(this.w,Crafty.viewport.width - this.w)
        })
        .bind("EnterFrame",function(frame){
            player = Crafty(player[0]);
            x = Math.abs((this.x+this._w/2)-player.x);
        
            if((x<40)&& this._y < player.y && frame.frame % 20 == 0){
                this.trigger("Shoot");
            }
            this.y += 1.5;
        })
        .bind("Shoot",function(){
            var bullet = Crafty.e("Weapon1","EnemyBullet");
            bullet.attr({
                x: this._x+this._w/2-bullet.w/2,
                y: this._y+this._h-bullet.h/2,
                rotation: 180,
                xspeed: 5 * Math.sin(this._rotation / (180 / Math.PI)),
                yspeed: 5 * Math.cos(this._rotation / (180 / Math.PI))
            });   
        });
    }
});

// Shoots at you
Crafty.c("Ghost",{
    hp:1,
    init:function(){
        var player = Crafty("Player");
        var x = 0;
        this.addComponent("Enemy","ghost")
        .origin("center")
        .attr({
            rotation:0,
            y:-this.h,
            x:Crafty.math.randomInt(this.w,Crafty.viewport.width - this.w)
        })
        .bind("EnterFrame",function(frame){
            player = Crafty(player[0]);
            x = Math.abs((this.x+this._w/2)-player.x);
        
            if((x<40)&& this._y < player.y && frame.frame % 20 == 0){
                this.trigger("Shoot");
            }
            this.y += 1.5;
        })
        .bind("Shoot",function(){
            var bullet = Crafty.e("Weapon2","EnemyBullet");
            bullet.attr({
                x: this._x+this._w/2-bullet.w/2,
                y: this._y+this._h-bullet.h/2,
                rotation: 180,
                xspeed: 5 * Math.sin(this._rotation / (180 / Math.PI)),
                yspeed: 5 * Math.cos(this._rotation / (180 / Math.PI))
            });   
        });
    }
});

// Shoots at you
Crafty.c("Lvl1Boss",{
    hp:20,
    init:function(){
        var player = Crafty("Player");
        var x = 0;
        this.addComponent("Enemy","lvl1boss")
        .origin("center")
        .attr({
            rotation:0,
            y:-this.h,
            x:Crafty.math.randomInt(this.w,Crafty.viewport.width - this.w)
        })
        .bind("EnterFrame",function(frame){
            player = Crafty(player[0]);
            x = Math.abs((this.x+this._w/2)-player.x);
        
            if((x<40)&& this._y < player.y && frame.frame % 20 == 0){
                this.trigger("Shoot");
            }
            this.y += 1.5;
        })
        .bind("Shoot",function(){
            var bullet = Crafty.e("Weapon3","EnemyBullet");
            bullet.attr({
                x: this._x+this._w/2-bullet.w/2,
                y: this._y+this._h-bullet.h/2,
                rotation: 180,
                xspeed: 5 * Math.sin(this._rotation / (180 / Math.PI)),
                yspeed: 5 * Math.cos(this._rotation / (180 / Math.PI))
            });   
        });
    }
});