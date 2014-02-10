@echo off

copy src\CrissCrosswordsNamespace.js + src\joe\Utility.js + src\joe\Strings.js + src\joe\ClassEx.js + src\joe\Listeners.js + src\joe\Graphics.js + src\joe\UpdateLoop.js merged01.js

copy merged01.js + src\joe\IO\KeyInput.js + src\joe\IO\MouseInput.js + src\joe\IO\Multitouch.js + src\joe\GameState.js merged02.js

copy merged02.js + src\joe\Math\MathEx.js + src\joe\Math\AABBmodule.js + src\joe\Resources\Resources.js + src\joe\Resources\FontEx.js + src\joe\Resources\BitmapFont.js + src\joe\Resources\Sound.js merged03.js

copy merged03.js + src\joe\Physics\Modules.js + src\joe\Physics\Collider.js + src\joe\Scene\Scene.js + src\joe\Scene\Camera.js + src\joe\Scene\View.js + src\joe\Scene\LayerBitmap.js + src\joe\Scene\LayerSprites.js merged04.js

copy merged04.js + src\joe\Sprites\SpriteSheet.js + src\joe\Sprites\Sprite.js + src\joe\GUI\GUI.js + src\joe\GUI\WidgetModule.js + src\joe\GUI\HighlightBox.js merged05.js
 
copy merged05.js + src\joe\GUI\Overlays.js + src\joe\GUI\CaptureBox.js + src\joe\GUI\ClickBox.js + src\joe\GUI\ToggleBox.js + src\joe\GUI\Label.js merged06.js

copy merged06.js + src\Strings.js + src\WordGrid.js + src\PlayCommands.js + src\PlayLayer.js + src\StateTitle.js + src\StatePlay.js + src\HelpLayer.js merged07.js

copy merged07.js + src\InputLayer.js + src\DialogLayer.js + src\InstructionsLayer.js + src\CrissCrosswords.js ccw.js

del merged*.js

echo Done!
