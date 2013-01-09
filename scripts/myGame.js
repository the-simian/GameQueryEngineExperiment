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
            .addGroup('player', {posx:300, posy:100, width:128, height:64})
                .addSprite('playerBody', {animation: playerAnimation['idle'], posx:0, posy:0, width:128, height:64})
                .addSprite('playerThruster',{ posx:-62, posy:13, width:64, height:32})
                ;

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


            
            $('#actors').addGroup('enemy1',{posx:1000, posy:25, width:256, height:256}).addSprite('enemyBody', {
            
            
             animation: enemies[0]['1dle'],
            width:128, height:128
            
            });

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

            //TODO: use migration guide to refactor this
            /*Base Enemy Objects*/
            function Enemy(node) {
                this.shield = 2;
                this.speedx = -5;
                this.speedy = 0;
                this.$el = $(node);

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
                };

                this.updateX = function(playerNode){
                    var newPosition = pareInt(this.$el.css('left')) + this. speedX;
                    this.$el.css('left', newPosition + "px");
                };

                this.updateY = function(playerNode){
                    var newPosition = pareInt(this.$el.css('top')) + this. speedY;
                    this.$el.css('top', newPosition + "px");
                };
            }

            //Minion
            function Minion(node){
                this.$el = $(node);
            }
            Minion.prototype = new Enemy();
            Minion.prototype.updateY = function(playerNode){
                var pos = parseInt(this.$el.css('top'));
                this.$el.css('top', (pos-2) + 'px');
            }

            //Brainy
            function Brainy(node){
                this.$el = $(node);
                this.shield = 5;
                this.speedy = 1;
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
                var pos = parseInt(this.$el.css('left'));
                if(pos > (playgroundWidth - 200)){
                    this.$el.css('left', pos + this.speedx + 'px');
                }
            }











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
                        $('#enemyBody').setAnimation(enemies[0]['explode']).css({'width':256, 'height':256});
                        allowRight = false;
                        }
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

                        $('#enemyBody').setAnimation(enemies[0]['idle']).css({'width':128, 'height':128});

                        allowRight = true;
                        break;
                }
            });


            /*Start The Game*/
            $.playground().startGame();
        });