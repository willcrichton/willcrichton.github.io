/*
 * game.js: handles most game logic
 */

// paperjs has to have this run before
// any modules can reference paper variables
// todo--better, more modular way to do this?
paper.install(window);
paper.setup('fishies');

define(function(require) {
    'use strict';

    var 
    Fish = require('fish'),
    Scope = require('scope'),
    C    = require('constants'),
    Util = require('util');
    

    var Game = {
        start: function() {
            this.d = new Date();
            this.startTime = this.d.getTime();
            this.player = new Fish(view.bounds.center);
            this.crosshairs = new Scope(view.bounds.center);
            console.log("MADE CROSSHAIRS");
            this.lastFish = 0;
            this.score = 0;
            this.started = true;
            this.lastShot = 0;
            this.lf = false;
            this.beats = [186.0, 592.0, 997.0, 1399.0, 1799.0, 2199.0, 2598.0, 2997.0, 3396.0, 3794.0, 4196.0, 4599.0, 5001.0, 5401.0, 5800.0, 6200.0, 6599.0, 6997.0, 7394.0, 7793.0, 8192.0, 8591.0, 8991.0, 9390.0, 9788.0, 10185.0, 10584.0, 10985.0, 11386.0, 11786.0, 12184.0, 12582.0, 12981.0, 13378.0, 13774.0, 14170.0, 14567.0, 14964.0, 15363.0, 15762.0, 16161.0, 16560.0, 16959.0, 17359.0, 17759.0, 18158.0, 18558.0, 18956.0, 19355.0, 19754.0, 20153.0, 20552.0, 20951.0, 21350.0, 21750.0, 22150.0, 22549.0, 22948.0, 23347.0, 23747.0, 24146.0, 24544.0, 24944.0, 25345.0, 25747.0, 26147.0, 26547.0, 26948.0, 27349.0, 27748.0, 28147.0, 28546.0, 28946.0, 29345.0, 29743.0, 30143.0, 30542.0, 30941.0, 31339.0, 31738.0, 32138.0, 32536.0, 32936.0, 33336.0, 33735.0, 34133.0, 34532.0, 34931.0, 35332.0, 35732.0, 36130.0, 36530.0, 36929.0, 37328.0, 37726.0, 38123.0, 38520.0, 38918.0, 39316.0, 39715.0, 40114.0, 40514.0, 40914.0, 41313.0, 41713.0, 42112.0, 42511.0, 42910.0, 43309.0, 43707.0, 44106.0, 44505.0, 44903.0, 45303.0, 45702.0, 46100.0, 46498.0, 46897.0, 47298.0, 47697.0, 48096.0, 48496.0, 48896.0, 49297.0, 49697.0, 50097.0, 50496.0, 50895.0, 51294.0, 51694.0, 52093.0, 52492.0, 52892.0, 53291.0, 53691.0, 54090.0, 54489.0, 54887.0, 55286.0, 55685.0, 56084.0, 56482.0, 56883.0, 57283.0, 57683.0, 58081.0, 58480.0, 58881.0, 59280.0, 59679.0, 60078.0, 60477.0, 60877.0, 61276.0, 61676.0, 62075.0, 62474.0, 62873.0, 63273.0, 63674.0, 64075.0, 64474.0, 64875.0, 65276.0, 65676.0, 66075.0, 66474.0, 66873.0, 67273.0, 67673.0, 68072.0, 68471.0, 68870.0, 69268.0, 69666.0, 70065.0, 70464.0, 70863.0, 71262.0, 71661.0, 72061.0, 72460.0, 72859.0, 73259.0, 73660.0, 74059.0, 74458.0, 74857.0, 75256.0, 75654.0, 76051.0, 76448.0, 76846.0, 77245.0, 77644.0, 78042.0, 78441.0, 78840.0, 79240.0, 79640.0, 80039.0, 80439.0, 80839.0, 81239.0, 81638.0, 82038.0, 82437.0, 82835.0, 83233.0, 83632.0, 84031.0, 84429.0, 84827.0, 85226.0, 85626.0, 86025.0, 86425.0, 86824.0, 87224.0, 87624.0, 88023.0, 88424.0, 88824.0, 89223.0, 89623.0, 90023.0, 90422.0, 90821.0, 91220.0, 91619.0, 92018.0, 92417.0, 92816.0, 93215.0, 93615.0, 94014.0, 94413.0, 94812.0, 95213.0, 95615.0, 96017.0, 96419.0, 96821.0, 97223.0, 97626.0, 98027.0, 98427.0, 98828.0, 99229.0, 99629.0, 100028.0, 100428.0, 100828.0, 101227.0, 101624.0, 102021.0, 102419.0, 102819.0, 103218.0, 103618.0, 104016.0, 104416.0, 104816.0, 105217.0, 105616.0, 106015.0, 106415.0, 106815.0, 107216.0, 107615.0, 108013.0, 108409.0, 108804.0, 109197.0, 109591.0, 109985.0, 110381.0, 110779.0, 111179.0, 111582.0, 111986.0, 112390.0, 112791.0, 113191.0, 113590.0, 113987.0, 114385.0, 114781.0, 115176.0, 115573.0, 115972.0, 116371.0, 116770.0, 117167.0, 117567.0, 117967.0, 118366.0, 118766.0, 119165.0, 119564.0, 119963.0, 120363.0, 120762.0, 121162.0, 121563.0, 121963.0, 122363.0, 122764.0, 123163.0, 123563.0, 123962.0, 124362.0, 124762.0, 125161.0, 125561.0, 125961.0, 126361.0, 126759.0, 127157.0, 127555.0, 127954.0, 128352.0, 128751.0, 129151.0, 129551.0, 129951.0, 130350.0, 130749.0, 131149.0, 131549.0, 131947.0, 132346.0, 132745.0, 133144.0, 133542.0, 133939.0, 134336.0, 134734.0, 135132.0, 135531.0, 135930.0, 136330.0, 136730.0, 137129.0, 137529.0, 137928.0, 138327.0, 138726.0, 139125.0, 139524.0, 139922.0, 140320.0, 140719.0, 141118.0, 141517.0, 141916.0, 142315.0, 142715.0, 143115.0, 143514.0, 143913.0, 144312.0, 144712.0, 145112.0, 145513.0, 145913.0, 146313.0, 146713.0, 147113.0, 147514.0, 147913.0, 148312.0, 148711.0, 149110.0, 149509.0, 149908.0, 150306.0, 150705.0, 151104.0, 151504.0, 151902.0, 152301.0, 152700.0, 153099.0, 153499.0, 153897.0, 154296.0, 154696.0, 155095.0, 155494.0, 155893.0, 156292.0, 156692.0, 157092.0, 157491.0, 157891.0, 158290.0, 158689.0, 159088.0, 159487.0, 159885.0, 160285.0, 160684.0, 161083.0, 161482.0, 161882.0, 162282.0, 162682.0, 163081.0, 163480.0, 163880.0, 164280.0, 164679.0, 165078.0, 165477.0, 165875.0, 166274.0, 166673.0, 167072.0, 167471.0, 167871.0, 168270.0, 168670.0, 169069.0, 169469.0, 169868.0, 170268.0, 170668.0, 171068.0, 171467.0, 171867.0, 172266.0, 172664.0, 173063.0, 173461.0, 173859.0, 174259.0, 174658.0, 175058.0, 175458.0, 175858.0, 176258.0, 176658.0, 177056.0, 177456.0, 177856.0, 178257.0, 178656.0, 179058.0, 179464.0, 179871.0, 180271.0, 180666.0, 181058.0, 181451.0, 181838.0, 182217.0, 182608.0, 183013.0]

            for (var i = 0; i < 10; i++) {
                this.newEnemy();
            }
        },

        end: function() {
            document.getElementById('dialogue').style.display = 'block';
            document.getElementById('score').innerHTML = 'Your score was ' + this.score;
            project.activeLayer.removeChildren();
            this.started = false;
        },

        elapsed: function() {
          var now = new Date();
          return now.getTime() - this.startTime;
        },

        scaleFactor: function() {
          var e = this.elapsed();
          while (e - 100 > this.beats[0]) {
            this.beats.shift();
          }
          if (Math.abs(e - this.beats[0]) < 50 || Math.abs(e-this.beats[0] - 90) <= 15) {
            return 0.75;
          }
          console.log(e - this.beats[0]);
          return 2;
        },

        legallyFiring: function(e) {
          //console.log(e.time - this.lastShot);
          if (Key.isDown('space') && (e.time - this.lastShot > C.SHOT_COOLDOWN)) {
            this.lastShot = e.time;
            //console.log("attempt to fire at " + e.time + " succeeded");
            return true;
          }
          //console.log("attempt to fire at " + e.time + " failed");
          return false;
        },

        loop: function(e) {

            if (!this.started) {
                return;
            }

            var player = this.player;
            var crosshairs = this.crosshairs;
            var chArea = crosshairs.strokeBounds.width * crosshairs.strokeBounds.height;
            this.lf = this.legallyFiring(e);

            // handle keyboard events for moving fish
            if (Key.isDown('w')) {
                player.addVelocity([0, -C.ACCELERATION]);
            } else if (Key.isDown('s')) {
                player.addVelocity([0, C.ACCELERATION]);
            } 
            
            if (Key.isDown('a')) {
                player.addVelocity([-C.ACCELERATION, 0]);
            } else if (Key.isDown('d')) {
                player.addVelocity([C.ACCELERATION, 0]);
            }

            if (Key.isDown('up')) {
              crosshairs.addVelocity([0, -C.ACCELERATION]);
            }
            else if (Key.isDown('down')) {
              crosshairs.addVelocity([0, C.ACCELERATION]);
            }
            if (Key.isDown('left')) {
              crosshairs.addVelocity([-C.ACCELERATION, 0]);
            }
            else if (Key.isDown('right')) {
              crosshairs.addVelocity([C.ACCELERATION, 0]);
            }

            //player.children[0].fillColor = (this.lf ? '#aaa' : '#a00');
            //crosshairs.children[0].fillColor = (this.lf ? '#a00' : '#aaa');
            document.body.style.background = (this.lf ? '#440000' : 'black');

            // do simple 2D physics for the player
            // calculate velocity with deceleration
            var playerBounds = player.strokeBounds;

            if (!view.bounds.contains(playerBounds)) {
                
                // fixme: player can still get stuck. detection isn't 
                var nx = playerBounds.width / 2, ny = playerBounds.height / 2;
                if ((player.position.x <= nx && player.velocity[0] < 0) ||
                    (player.position.x >= view.bounds.width - nx && player.velocity[0] > 0)) {
                    player.velocity[0] = 0;
                } else if((player.position.y <= ny && player.velocity[1] < 0) ||
                          (player.position.y >= view.bounds.height - ny && player.velocity[1] > 0)) {
                    player.velocity[1] = 0;
                }
            }

            var cBounds = crosshairs.strokeBounds;
            if (!view.bounds.contains(cBounds)) {
                
                // fixme: player can still get stuck. detection isn't 
                var nx = cBounds.width / 2, ny = cBounds.height / 2;
                if ((crosshairs.position.x <= nx && crosshairs.velocity[0] < 0) ||
                    (crosshairs.position.x >= view.bounds.width - nx && crosshairs.velocity[0] > 0)) {
                    crosshairs.velocity[0] = 0;
                } else if((crosshairs.position.y <= ny && crosshairs.velocity[1] < 0) ||
                          (crosshairs.position.y >= view.bounds.height - ny && crosshairs.velocity[1] > 0)) {
                    crosshairs.velocity[1] = 0;
                }
            }


            // move the fish by the given velocity
            player.position = player.position.add(player.velocity);
            crosshairs.position = crosshairs.position.add(crosshairs.velocity);
            
            // change the fish's orientation accordingly
            if ((player.velocity[0] > 0 && player.orientation == C.LEFT) ||
                (player.velocity[0] < 0 && player.orientation == C.RIGHT)) {
                player.rotate(180);
                player.orientation = !player.orientation;
            }

            // handle enemy fish logic and collisions
            _.forEach(project.activeLayer.children, function(otherFish) {
                if (player.id === otherFish.id) {
                    return;
                }
                
                var 
                otherBounds = otherFish.strokeBounds,
                overlap = otherBounds.intersect(playerBounds),
                overlapArea = overlap.width * overlap.height,
                otherArea   = otherBounds.width * otherBounds.height;

                if (overlapArea / otherArea > C.MIN_EAT_OVERLAP & overlap.width > 0 && otherFish.id !== crosshairs.id) {
                    this.end();
                }
                
                var cBounds = crosshairs.strokeBounds,
                    chArea = cBounds.width * cBounds.height,
                    chOverlap = otherBounds.intersect(cBounds),
                    chOverlapArea = chOverlap.width * chOverlap.height;
                if ((chOverlap.width >= Math.min(cBounds.width, otherBounds.width)) &&
                     chOverlap.height >= Math.min(cBounds.height, otherBounds.height) &&
                     otherFish.id !== crosshairs.id && this.lf) {
                  //console.log(otherBounds.width)
                  //console.log("shrinking")
                  otherFish.scale(this.scaleFactor());
                  //console.log(otherBounds.width);
                  //console.log(otherFish.strokeBounds.width)
                  if (otherFish.strokeBounds.width < 60) {
                    otherFish.remove();
                    this.score++;
                  }
                }

                otherFish.position = otherFish.position.add(otherFish.velocity);

                /*if (!otherBounds.intersects(view.bounds) && !view.bounds.contains(otherBounds)) {
                  otherFish.remove();
                }*/
            }, this);
            
            Util.decelerate(player.velocity);
            Util.decelerate(crosshairs.velocity);

            // generate fishes every second
            if (e.time - this.lastFish >= C.FISH_SPAWN_TIME) {
                this.newEnemy();
                this.lastFish = e.time;
            }
        },

        newEnemy: function() {
            var pos = Math.random() * view.bounds.height;
            var side = Math.random() > 0.5;
            var enemy = new Fish([side ? view.bounds.width : 0, pos]);
            
            var cur_scale = this.player.strokeBounds.width / enemy.strokeBounds.width;
            var rand = (Math.random() * 2 - 1) * (C.MAX_ENEMY_VARIANCE - C.MIN_ENEMY_VARIANCE);
            rand += Util.sign(rand) * C.MIN_ENEMY_VARIANCE;

            var scale = cur_scale + rand;
            enemy.scale(scale);

            enemy.position.x += (side ? 1 : -1) * enemy.strokeBounds.width / 2;
            
            enemy.addVelocity([(side ? -1 : 1) * 3 * (cur_scale / scale), 
                               ((pos > 0.5 * view.bounds.height) ? -1 * Math.random() : Math.random())]);
            enemy.children[0].fillColor = '#' + (Math.round(0xffffff * Math.random())).toString(16);
            enemy.origin = (side ? 'l' : 'r');
            enemy.rotate(side ? 0 : 180);
        }
    };

    view.onFrame = _.bind(Game.loop, Game);

    return Game;
});
