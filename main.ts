// --- Configuration ---
const GRAVITY = 500
const MAX_CHARGE = 250
const CHARGE_RATE = 5
const MOVE_SPEED = 60
const TONGUE_RANGE = 112

// --- Setup State ---
let lives = 3
let maxLives = 3
let lastX = 0
let lastY = 0
let isCharging = false
let chargeLevel = 0
let isGrappling = false
let tongueCount = 1

// --- Images ---
const frogIdle = img`
. . . . . . . . . . . . . . . . 
. . 7 7 7 . . . . . 7 7 7 . . . 
. 7 7 1 1 7 7 7 7 7 1 f 7 7 . . 
. 7 7 1 f 7 7 7 7 7 1 f 7 7 . . 
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
7 7 3 3 7 7 7 7 7 7 7 3 3 7 7 . 
7 7 3 3 7 7 7 7 7 7 7 3 3 7 7 . 
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
7 7 7 7 7 6 6 6 6 6 7 7 7 7 7 . 
. 7 7 7 7 7 7 7 7 7 7 7 7 7 . . 
. . 7 7 . . . . . . . 7 7 . . . 
. 7 7 7 . . . . . . . 7 7 7 . . 
`
const frogCharging = img`
. . . . . . . . . . . . . . . . 
. . 4 4 4 . . . . . 4 4 4 . . . 
. 4 4 1 1 4 4 4 4 4 1 1 4 4 . . 
. 4 4 1 f 4 4 4 4 4 1 f 4 4 . . 
4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . 
4 4 2 2 4 4 4 4 4 4 4 2 2 4 4 . 
4 4 2 2 4 4 4 4 4 4 4 2 2 4 4 . 
4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . 
. 4 4 4 . . . . . . . 4 4 4 . . 
`
const starImg = img`
. . . . . 5 . . . . . 
. . . . 5 5 5 . . . . 
. . 5 5 5 5 5 5 5 . . 
. . . 5 5 5 5 5 . . . 
. . 5 5 5 5 5 5 5 . . 
. . 5 5 . . . 5 5 . . 
`
const flyImg = img`. . f f . . \n . f 1 1 f . \n . . f f . .`
const heartRed = img`. 2 2 . 2 2 . \n 2 2 2 2 2 2 2 \n . . 2 2 2 . .`
const heartGrey = img`. b b . b b . \n b b b b b b b \n . . b b b . .`

// --- Level Construction ---
scene.setBackgroundColor(9)

// Create a wide map (60 tiles wide, 12 tiles high)
tiles.setTilemap(tiles.createTilemap(
    hex`3c000c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000`,
    img`
        .
    `,
    [img`.`],
    TileScale.Sixteen
))

const floorTile = img`
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
7 f f f f f f f f f f f f f f 7
7 f f f f f f f f f f f f f f 7
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 7
`

// Build a long starting platform, then a gap, then a second platform
for (let i = 0; i < 60; i++) {
    // Platform 1: Start to tile 15
    // GAP: Tiles 16 to 22 (This is where you can die!)
    // Platform 2: Tile 23 to 60
    if (i < 16 || i > 22) {
        tiles.setTileAt(tiles.getTileLocation(i, 10), floorTile)
        tiles.setWallAt(tiles.getTileLocation(i, 10), true)
    }
}

// --- Init Sprites ---
let player = sprites.create(frogIdle, SpriteKind.Player)
player.ay = GRAVITY
tiles.placeOnTile(player, tiles.getTileLocation(1, 9))
lastX = player.x
lastY = player.y
scene.cameraFollowSprite(player)

// Star Checkpoint (On the second platform)
let checkpointStar = sprites.create(starImg, SpriteKind.Food)
tiles.placeOnTile(checkpointStar, tiles.getTileLocation(25, 9))

// Fly (Introduced near the end)
let fly = sprites.create(flyImg, SpriteKind.create())
tiles.placeOnTile(fly, tiles.getTileLocation(45, 5))
fly.vx = 30
fly.setBounceOnWall(true)

// --- Controls ---
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    let dx = player.x - fly.x
    let dy = player.y - fly.y
    let dist = Math.sqrt(dx * dx + dy * dy)
    if (tongueCount > 0 && dist <= TONGUE_RANGE) {
        isGrappling = true
        tongueCount = 0
        music.pewPew.play()
    }
})

controller.B.onEvent(ControllerButtonEvent.Released, function () {
    isGrappling = false
    player.ay = GRAVITY
})

// --- Game Loop ---
game.onUpdate(function () {
    let isGrounded = player.isHittingTile(CollisionDirection.Bottom)
    if (isGrounded && !isGrappling) tongueCount = 1

    if (isGrappling) {
        player.ay = 0
        player.vx = (player.x < fly.x) ? 140 : -140
        player.vy = (player.y < fly.y) ? 140 : -140
    } else if (isGrounded) {
        player.vx = 0
        if (controller.A.isPressed()) {
            isCharging = true
            player.setImage(frogCharging)
            chargeLevel = Math.min(chargeLevel + CHARGE_RATE, MAX_CHARGE)
            player.sayText(Math.floor((chargeLevel / MAX_CHARGE) * 100) + "%")
        } else if (isCharging) {
            player.sayText("")
            player.vy = -chargeLevel
            player.vx = MOVE_SPEED
            isCharging = false
            chargeLevel = 0
            player.setImage(frogIdle)
        }
    }

    // --- FALLING DEATH LOGIC ---
    // If the frog falls below the platforms (Y > 200)
    if (player.y > 220) {
        lives -= 1
        isGrappling = false
        music.powerDown.play()
        if (lives <= 0) {
            game.over(false)
        } else {
            // Respawn at last saved checkpoint (start or star)
            player.setPosition(lastX, lastY - 20)
            player.setVelocity(0, 0)
        }
    }
})

// Checkpoint Interaction
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    if (lastX != otherSprite.x) {
        lastX = otherSprite.x
        lastY = otherSprite.y
        otherSprite.image.replace(5, 7)
        otherSprite.startEffect(effects.fountain, 500)
        music.baDing.play()
        player.sayText("Checkpoint!", 1000)
    }
})

// --- UI Rendering ---
game.onPaint(function () {
    if (isGrappling) {
        screen.drawLine(player.x - scene.cameraLeft(), player.y - scene.cameraTop(),
            fly.x - scene.cameraLeft(), fly.y - scene.cameraTop(), 3)
    }
    for (let i = 0; i < maxLives; i++) {
        let imgH = (i < lives) ? heartRed : heartGrey
        screen.drawImage(imgH, 5 + (i * 10), 5)
    }
})