(function (window, document, undefined) {

	// Constructor for the AudioSprite object
	// usage: var sprite = new AudioSprite("sound.wav", 100);
	// length specified in milliseconds
	var AudioSprite = function (src, numSprites) {
		var _this = this,
			numTracks, i, audio, sounds = [], timers = [],
			forceLoad, setSpriteLength;
	
		numSprites = numSprites || 1;
		numTracks = ("ontouchstart" in window || "createTouch" in document) ? 1 : numSprites;
	
		// Create the audio objects
		for (i = 0; i < numTracks; i++) {
			audio = new Audio();
			audio.autobuffer = true;
			audio.src = src;
			audio.load();
			audio.userPaused = false;
			sounds.push(audio);
			timers.push(0);
		}
		this.sounds = sounds;
		this.timers = timers;
		this.numTracks = numTracks;
		
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
				length = sound.duration / this.numSprites,
				startTime = length * position,
				endTime = length * (position + 1);
			
			
			
			// If the audio hasn't loaded yet, try again
			if (sound.readyState !== 4 || sound.seekable.length === 0) {
				return setTimeout(function () {
					_this.play(position);
				}, 10);
			}
		
			// Only deal with the sprite settings if a position is passed in, and there are more than one sprites
			// If no position is passed in, the whole audio clip will be played until the end
			if (position !== undefined && this.numSprites > 1) {
				
				// Set the new time for the current sprite, only if the user had not paused it
				if (!sound.userPaused) {
					sound.currentTime = startTime;
				}
				
				// Set a timer that will check for the end of the sprite
				clearInterval(timer);
				timer = setInterval(function () {
					_this.checkTime(position, endTime);
				}, 1);
				if (this.numTracks === 1) {
					this.timers[0] = timer;
				} else {
					this.timers[position] = timer;
				}
			}
			
			// Plays the audio
			sound.play();
			sound.userPaused = false;
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
		},
		
		// Checks for the end of the sprite and pauses the audio when it's reached
		checkTime: function (position, endTime) {
			var sound = this.numTracks === 1 ? this.sounds[0] : this.sounds[position],
				timer = this.numTracks === 1 ? this.timers[0] : this.timers[position];
			if (sound.currentTime >= endTime) {
				sound.pause();
				clearInterval(timer);
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
		}
	};
	
	window.AudioSprite = AudioSprite;
	window.Sound = Sound;

})(window, document);
