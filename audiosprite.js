/*!
 * AudioSprite v1.11
 *
 * Copyright 2011, Johannes Koggdal
 * MIT License
 */
(function (window, document, undefined) {
	var isTouch = ("ontouchstart" in window||"createTouch" in document);

	// Constructor for the AudioSprite object
	// usage: var sprite = new AudioSprite("sound.wav", 100);
	// length specified in milliseconds
	var AudioSprite = function (src, numSprites) {
		var _this = this,
			numTracks, i, audio,
			sounds = [], timers = [], sprites = [],
			forceLoad, setSpriteLength;
		
		numSprites = numSprites || 1;
		
		// Get specific sprite sizes
		if (numSprites instanceof Array) {
			sprites = numSprites;
			numSprites = sprites.length;
		}
	
		// Get number of tracks
		// iOS only deals with one track at a time, so we set this to 1 for iOS
		numTracks = isTouch ? 1 : numSprites;

	
		// Create the audio objects
		for (i = 0; i < numTracks; i++) {
			audio = new Audio();
			audio.autobuffer = true;
			audio.loaded = false;
			audio.src = src;
			audio.load();
			audio.userPaused = false;
			audio.loopSprite = false;
			
			// Bind event handler to loop the audio when the end is reached
			audio.addEventListener("ended", (function (i, sprite, audio) { return function () {
				if (audio.loopSprite) {
					sprite.play(i);
				}
			}; })(i, _this, audio), false);
			
			sounds.push(audio);
			timers.push(0);
		}
		this.sounds = sounds;
		this.timers = timers;
		this.sprites = sprites;
		this.numTracks = numTracks;
		this.lastCurrentTime = 0;
		this.totalDiff = 0;
		this.diffs = 0;
		
		// Set the number of sprites in the current file
		this.numSprites = numSprites;
		
		// Force the audio to load on iOS
		// This method is called by a touch event, since iOS only loads
		// the audio when it's triggered by a user action
		forceLoad = function () {
			sounds[0].play();
			sounds[0].pause();
			document.removeEventListener("touchstart", forceLoad, true);
		};
		
		// Bind event handler for iOS to force the audio to load
		document.addEventListener("touchstart", forceLoad, true);
	};
	AudioSprite.prototype = {

		// Plays the audio at the specified position
		play: function (position) {
			var _this = this,
				sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position],
				timer = this.numTracks === 1 ? this.timers[0] : this.timers[position],
				length = sound.duration / this.numSprites * 1000,
				i, sprite;
			
			// If the audio hasn't loaded yet, try again
			if ((sound.readyState !== 4 && !isTouch && !sound.loaded) || (isTouch && sound.seekable && sound.seekable.length === 0 && !sound.loaded)) {
				return setTimeout(function () {
					_this.play(position);
				}, 10);
			}
			sound.loaded = true;
			
			// Fill the sprite array if it hasn't been filled yet
			if (this.sprites.length === 0) {
				for (i = 0; i < this.numSprites; i++) {
					this.sprites.push({
						start: i * length,
						length: length
					});
				}
			}
			sprite = this.sprites[position];
			
			// Only deal with the sprite settings if a position is passed in, and there are more than one sprites
			// If no position is passed in, the whole audio clip will be played until the end
			if (position !== undefined && this.numSprites > 1) {
				
				// Set the new time for the current sprite, only if the user had not paused it
				if (!sound.userPaused) {
					sound.currentTime = sprite.start / 1000;
					sound.lastStart = sprite.start / 1000;
				}
				
				sound.play();
				sound.userPaused = false;
				
				// Set a custom timer that will keep track of the current position and end time
				// This is done to get a more frequent update of the current time,
				// since some browsers, especially Firefox, updates with large intervals
				sound.time = sprite.start;
				sound.timeStart = (new Date()).getTime();
				clearInterval(timer);
				timer = setInterval(function () {
					sound.time = sprite.start + (new Date()).getTime() - sound.timeStart;
					
					_this.checkTime(position, sprite.start + sprite.length);
				}, 1);
				if (this.numTracks === 1) {
					this.timers[0] = timer;
				} else {
					this.timers[position] = timer;
				}
				
			} else {
			
				// Play the full audio file if no position was set
				if (!sound.userPaused) {
					sound.currentTime = 0;
					sound.lastStart = 0;
				}
				sound.play();
				sound.userPaused = false;
			}
		},
		
		// Pauses the audio
		pause: function (position) {
			var sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position];
			sound.pause();
			sound.userPaused = true;
		},
		
		// Stops the audio and reset the time to the beginning
		stop: function (position) {
			var sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position];
			sound.pause();
			sound.currentTime = 0;
			sound.loopSprite = false;
		},
		
		// Plays the audio and loops when it reaches the end
		loop: function (position) {
			var sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position];
			sound.loopSprite = true;
			this.play(position);
		},
		
		// Checks for the end of the sprite and pauses the audio when it's reached
		checkTime: function (position, endTime) {
			var _this = this,
				sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position],
				timer = this.numTracks === 1 ? this.timers[0] : this.timers[position];

			// Check if the timer is past the end time, and if so, pause the audio
			if (sound.time >= endTime && sound.currentTime * 1000 >= endTime) {
				clearInterval(timer);
				sound.currentTime = 0;
				sound.pause();
				
				if (sound.loopSprite) {
					_this.play(position);
				}
			}
		}
	};

	// Constructor for the Sound object
	// usages: var sound = new Sound(sprite, 1);
	//         var sound = new Sound("sound.wav");
	// position specified as an index in the sprite
	var Sound = function (sprite, position) {
		if (typeof sprite === "string") {
			sprite = new AudioSprite(sprite);
			position = 0;
		}
		this.sprite = sprite;
		this.position = position;
	};
	Sound.prototype = {
		play: function () {
			this.sprite.play(this.position);
		},
		pause: function () {
			this.sprite.pause(this.position);
		},
		stop: function () {
			this.sprite.stop(this.position);
		},
		loop: function () {
			this.sprite.loop(this.position);
		}
	};
	
	window.AudioSprite = AudioSprite;
	window.Sound = Sound;

})(window, document);