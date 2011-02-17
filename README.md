AudioSprite
===========
AudioSprite is a small library made to make it easier to work with audio in the browser. It has fixes to make it crossbrowser and that means it also supports iOS.

iOS Safari requires a user action to be able to load audio, so this library uses a touchstart event to load the audio in iOS. Place your audio definitions early when the page is loading, and at the first tap from the user, the browser will start loading the audio. iOS also has problems with multiple audio objects at once, so this library makes it easier to work with audio sprites (that works pretty much like image sprites).


The Objects
-----------
This library offers a few different ways to create the objects, to give you the option to choose how you want to work with it.
It consists of two different objects, AudioSprite and Sound. An AudioSprite is used to split up a file with multiple sounds into portions that you can use as Sound objects.


Syntax
------
By specifying the number of sprites:
	var sprite = new AudioSprite(src, numSprites);
	var sound = new Sound(sprite, index);

By specifying exact positions for each sprite:
	var sprite = new AudioSprite(src, [
		{ start: milliseconds, length: milliseconds },
		{ start: milliseconds, length: milliseconds }
	]);
	var sound = new Sound(sprite, index);

By specifying only one sound:
	var sound = new Sound(src);


Methods and properties
-------
These methods work on both AudioSprite and Sound objects. When used on AudioSprite, an index has to be passed to the method.

* play()
* pause()
* stop()
* loop()


You can access the actual audio object by using `sprite.sounds[index]`, or if you want to access it from a Sound object you can use `sound.sprite.sounds[index]`.


Audio formats
-------------
This library does not deal with browser differences in the formats they support. You will have to do those checks yourself, and then pass the right source path to the AudioSprite object.