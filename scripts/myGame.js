        $(document).ready(function () {
            

            /*Engine Values*/
            var $playground = $('#playground');
            var playgroundWidth =   1366;
            var playgroundHeight = 250;

            /*Background Values*/

            var OneScrollSpeed = 2;
            var TwoScrollSpeed = 7;
            var ThreeScrollSpeed = 10;

            var background1 = new $.gameQuery.Animation({ imageURL: "Content/background_images/starfield_1.png" });
            var background2 = new $.gameQuery.Animation({ imageURL: "Content/background_images/starfield_2.png" });
            var background3 = new $.gameQuery.Animation({ imageURL: "Content/background_images/starfield_2.png" });

            var background1r = new $.gameQuery.Animation({ imageURL: "Content/background_images/starfield_1r.png" });
            var background2r = new $.gameQuery.Animation({ imageURL: "Content/background_images/starfield_2r.png" });
            var background3r = new $.gameQuery.Animation({ imageURL: "Content/background_images/starfield_2r.png" });



            var backgroundMovementRate = 60;
            


            /*Create Playground*/
            $playground
            .playground({
                height: playgroundHeight,
                width: playgroundWidth,
                keyTracker: true
            })
            .addGroup('background', {
                width: playgroundWidth,
                height: playgroundHeight
            });

            var $background = $('#background');

            $background 
            .addSprite("background1", {
                animation: background1,
                width: playgroundWidth,
                height: playgroundHeight,
            })
            .addSprite("background1r", {
                animation: background1r,
                width: playgroundWidth,
                height: playgroundHeight,
                posx: playgroundWidth
            })
            .addSprite("background2", {
                animation: background2,
                width: playgroundWidth,
                height: playgroundHeight
            })
            .addSprite("background2r", {
                animation: background2r,
                width: playgroundWidth,
                height: playgroundHeight,
                posx: playgroundWidth
            })
            .addSprite("background3", {
                animation: background3,
                width: playgroundWidth,
                height: playgroundHeight
            })
            .addSprite("background3r", {
                animation: background3r,
                width: playgroundWidth,
                height: playgroundHeight,
                posx: playgroundWidth
            });

            var $bk1 =  $('#background1');
            var $bk2 =  $('#background2');
            var $bk3 =  $('#background3');
            var $bk1r =  $('#background1r');
            var $bk2r =  $('#background2r');
            var $bk3r =  $('#background3r');

            /*Move Background*/
            var scrollLeftBackground = function($el, speed){
                var rate = -1 * (speed)
                return ((-1* $el.x()) >  playgroundWidth) ? rate + (playgroundWidth * 2) : rate;
            };

            var moveBackgroundTiles =function () {
                $bk1.x(scrollLeftBackground($bk1, OneScrollSpeed), true);
                $bk1r.x(scrollLeftBackground($bk1r, OneScrollSpeed), true);
                $bk2.x(scrollLeftBackground($bk2, TwoScrollSpeed), true);
                $bk2r.x(scrollLeftBackground($bk2r, TwoScrollSpeed), true);
                $bk3.x(scrollLeftBackground($bk2, ThreeScrollSpeed), true);
                $bk3r.x(scrollLeftBackground($bk2r, ThreeScrollSpeed), true);
            };

            $.playground().registerCallback(moveBackgroundTiles, backgroundMovementRate);


            /*PlayerAnimation*/
            
            var playerAnimation = [];

            playerAnimation['idle'] = new $.gameQuery.Animation({imageURL:"Content/spritemaps/player/ship-blue_128_64.png"});
            playerAnimation['explode'] = new $.gameQuery.Animation({imageURL:"Content/spritemaps/player/explode_2048_1536.png"});

            playerAnimation['thruster'] = new $.gameQuery.Animation({
                                                                        imageURL:"Content/spritemaps/player/thruster_32_64.png", 
                                                                        numberOfFrame:15, 
                                                                        delta:64, 
                                                                        rate:10, 
                                                                        type: $.gameQuery.ANIMATION_HORIZONTAL 
                                                                    });
  

            $playground
            .addGroup('actors', {width: playgroundWidth, height:playgroundHeight})
            .addGroup('player', {posx:200, posy:100, width:128, height:64})
                .addSprite('playerBody', {animation: playerAnimation['idle'], posx:0, posy:0, width:128, height:64})
                .addSprite('playerThruster',{ posx:-62, posy:13, width:64, height:32})
                ;
            
            $playground.addGroup('playerMissileLayer',{width: playgroundWidth, height:playgroundHeight});
            $playground.addGroup('enemiesMissileLayer',{width: playgroundWidth, height:playgroundHeight});

            /*Enemy Animation*/

            var enemies = [];
            enemies[0] = [];
            enemies[0]['idle'] = new $.gameQuery.Animation({
                                                            imageURL:"Content/spritemaps/enemy/demon_kitty_128.png", 
                                                            numberOfFrame:59, 
                                                            delta:128, 
                                                            rate:15, 
                                                            type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_CALLBACK
                                                                
                                                            });


            enemies[0]['explode'] = new $.gameQuery.Animation({
                                                            imageURL:"Content/spritemaps/enemy/explode_256.png", 
                                                            numberOfFrame:11,
                                                            delta:256,
                                                            rate:30,
                                                            type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_CALLBACK
                                                            
                                                            });


            
            var $actors = $('#actors');

            /*Weapon Missile*/



            /*Player Object*/
            function Player(node){

                this.$el = $(node);
                this.replay = 3;
                this.shield = 3;
                this.respawnTime = -1;

                //This function damages the ship and returns true if this causes the ship to die.
                this.damage = function(){
                
                    if(!this.grace){
                        this.shield--;
                        if (this.shield == 0){
                            return true;
                        }
                        return false;
                    }
                    return false;
                };

                
                //this is to respawn the ship after a death and return true if the game is over
                this.respawn = function(){
            
                    this.replay--;
                    if(this.replay == 0){
                        return true;
                    }

                    this.grace = true;
                    this.shield = 3;

                    this.respawnTime = (new Date()).getTime();
                    this.$el.fadeTo(0, 0.5);
                    return false;
            
                };

                this.update = function(){
                    if((this.respawnTime > 0) && ((new Date()).getTime() - this.respawnTime) > 3000){
                        this.grace = false;
                        this.$el.fadeTo(0, 1);
                        this.respawnTime = -1;
                    }
                };

                return true;
            }

            var $player = $('#player');

            $player.addClass("player");
            $player[0].player = new Player($player);


            //TODO: use migration guide to refactor this
            /*Base Enemy Objects*/
            function Enemy(node) {
                this.shield = 2;
                this.speedX = -5;
                this.speedY = 1;
                this.$el = $(node);

                this.exploding = false

                // deals with damage endured by an enemy
                this.damage = function(){
                    this.shield--;
                    if(this.shield == 0){
                        return true;
                    }

                    return false;
                };
                
                //update position
                this.update = function(playerNode){

                   

                        this.updateX(playerNode);
                        this.updateY(playerNode);
                    


                    //console.log('update called', playerNode, this.$el, this.$el.x(), this.$el.y());
                }

                this.updateX = function(playerNode){
                    this.$el.x(this.speedX,true);
                }

                this.updateY = function(playerNode){
                    this.$el.y(this.speedY,true);
                }
            }

            //Minion
            function Minion(node){
                this.speedY = Math.floor(Math.random()*8) - 4 || 2;
                this.speedX = Math.floor(Math.random()* -7) || -5;
                this.$el = $(node);
            }
            Minion.prototype = new Enemy();
            Minion.prototype.updateY = function(playerNode){
                this.$el.y(this.speedY, true); 
                var pos = this.$el.y();
                if((pos > ((playgroundHeight) - 129))  ){
                    this.$el.y(-4, true); 
                    this.speedY =  -1 * this.speedY;
                }else if(pos < -1){
                    this.$el.y(4, true); 
                    this.speedY =  -1 * this.speedY;
                }
            }

            //Brainy
            function Brainy(node){
                this.$el = $(node);
                this.shield = 5;
                this.speedY = 1;
                this.alignmentOffset = 5;
            }
            Brainy.prototype = new Enemy();
            Brainy.prototype.updateY = function(playerNode){


                if((this.$el[0].gameQuery.posy + this.alignmentOffset) > $(playerNode)[0].gameQuery.posy){  
                    var newpos = parseInt(this.$el.css('top')) - this.speedy;
                    this.$el.css('top', newpos + "px");

                } else if ((this.$el[0].gameQuery.posy + this.alignmentOffset) < $(playerNode)[0].gameQuery.posy) {
                    var newpos = parseInt(this.$el.css('top')) + this.speedy;
                    this.$el.css('top', newpos + "px");
                }
            }


            //Boss
            function Boss(node){
                this.$el = $(node);
                this.shield = 20;
                this.speedx = -1;
                this.alignmentOffset = 35;
            }
            Boss.prototype = new Brainy();
            Boss.prototype.updateX = function(){
                var pos = this.$el.x();
                if(pos > (playgroundWidth - 200)){
                    this.$el.x( this.speedx);
                }
            }



            //enemy generation
            var enemyGenerationRate = 1000;

            var bossMode = false;
            var gameOver = false;

            var generateEnemies = function(){
                    

                

                if(!bossMode && !gameOver){
                    if(Math.random() < 0.4){

                      var name = "enemy1_" + Math.ceil(Math.random()*1000);
                      $actors.addSprite(name, {
                            animation: enemies[0]['idle'] , 
                            posx: playgroundWidth -128, 
                            posy: Math.random() * playgroundHeight,
                            width: 128, 
                            height: 128
                          
                          }
                        );

                        var $thisEnemy = $("#"+name);

                      $thisEnemy.addClass("enemy");
                      $thisEnemy[0].enemy = new Minion($thisEnemy);

                    }
                } 

            };

            $.playground().registerCallback(generateEnemies, enemyGenerationRate);

            /*enemy movement*/

            var enemyMovementnRate = 35;

            var playerHit;

            function explodePlayer(playerNode){
                  playerNode
                   .css({'width' : 256, 'height': 256, 'z-index': 9999}).x(-64, true).y(-96, true)
                  .children().hide().end()
                  .addSprite("explosion",{ 
                                          animation: enemies[0]['explode'],
                                          width:256,
                                          height:256

                                          }).width(256).height(256);
                
                    
                  
            }


            var moveEnemies = function(){
                if(!gameOver){
                    var $player = $('#player');
                    var $enemies = $playground.find('.enemy');

                    $enemies.each(function(event, el){
                        var $el = $(el);
                        


                        if(!this.exploding){
                        
                            this.enemy.update($player);
                            var posx = $el.x();
                            if( posx + 256 < 0){
                                $el.remove();
                                return;
                            }
                        }


                        var $collided = $el.collision(".gQ_group, #playerBody");


                        

                        if($collided.length){
                            if(this.enemy instanceof Minion){
                               this.exploding = true; 
                                
                              $(this)
                              .css({'width' : 256, 'height': 256, 'z-index': 9999}).x(-64, true).y(-64, true)
                              .setAnimation(enemies[0]["explode"], function(node){$(node).remove();})

                              ;
                            }


                            $(this).removeClass("enemy");




                            //you got rammed!



                            

                            if($player[0].player.damage()){
                            
                            
                               explodePlayer($player)
                            
                            }

                        }


                 


                    });

                    

                }

            };


            $playground.registerCallback(moveEnemies, enemyMovementnRate);


            var missiles = {
                player: {
                    fireOrb: new $.gameQuery.Animation({
                                                            imageURL:"Content/spritemaps/fireballs/fire_orb_32_32.png", 
                                                            numberOfFrame:31,
                                                            delta:32,
                                                            rate:30,
                                                            type: $.gameQuery.ANIMATION_HORIZONTAL | $.gameQuery.ANIMATION_CALLBACK
                                                        })
                
                }
                
            
            
            };

            var score = 0;
            var missileSpeed = 14
            var missileUpdateRate = 30;
            //update missile movement

            var $missiles;

            var moveMissiles = function(){
                $missiles = $playground.find('.player-missile');
                $missiles.each(function(event, el){

                    var $el = $(el);
                    var posx = $el.x();
                    $el.x(missileSpeed, true);
                    if(posx > playgroundWidth){
                        $el.remove();
                        return;
                    }


                    

                    //collision
                   
                    var $collisions = $el.collision('.gQ_group, .enemy');

                    if($collisions.length){
                        $collisions.each(function(){
                        
                            if($(this)[0].enemy.damage()){
                                if(this.enemy instanceof Minion){
                                    $el.remove();
                                    score ++;
                                    $('#score').text('Killed: ' + score);
                                    this.exploding = true; 
                                
                                    $(this)
                                      .css({'width' : 256, 'height': 256, 'z-index': 9999}).x(-64, true).y(-64, true)
                                      .setAnimation(enemies[0]["explode"], function(node){
                                        $(node).remove();


                                    });
                                }
                            }
                        
                        });
                    }
                });
            };

            $playground.registerCallback(moveMissiles, missileUpdateRate);


            var speed = 9;

            var checkPlayerPosition = function(){

                if($.gameQuery.keyTracker[83]){
                    $player.y(speed, true);
                }

                 if($.gameQuery.keyTracker[65]){
                    $player.x(-speed, true);
                }


                if($.gameQuery.keyTracker[68]){
                    $player.x(speed, true);
                }


                if($.gameQuery.keyTracker[87]){
                    $player.y(-speed, true);
                }

                //rawr
            
            
            };

            console.log('gh-pages');

            $playground.registerCallback(checkPlayerPosition, 30);

            //player keybinding
            var allowRight = true;
            //this is where the keybinding occurs
            $(document).keydown(function(e){
                switch(e.keyCode){
                    case 65: //this is left! (a)
                        $("#playerThruster").setAnimation();
                        break;

                    case 68: //this is right (d)
                        if(allowRight){
                            $("#playerThruster").setAnimation(playerAnimation["thruster"]);
                            allowRight = false;
                        }
                        break;
                    case 32:
                        var playerposx = $player.x();
                        var playerposy = $player.y();

                        var name = "playerMissile_" + Math.ceil(Math.random() * 1000);

                        $('#playerMissileLayer').addSprite(name, {
                            animation: missiles.player.fireOrb, 
                            posx: playerposx + 128, 
                            posy: playerposy + 12,
                            width:32,
                            height:32
                        });
                        $('#'+name).addClass('player-missile');
                        break;
                }
            });


            //this is where the keybinding occurs
            $(document).keyup(function(e){
                switch(e.keyCode){
                    case 65: //this is left! (a)
                        $("#playerThruster").setAnimation();
                        break;
                    case 68: //this is right (d)
                        $("#playerThruster").setAnimation();
                        allowRight = true;
                        break;
                }
            });


            /*Start The Game*/
            $.playground().startGame();
        });