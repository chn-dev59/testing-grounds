// --- Configuration & Constants ---
const GRAVITY = 500
const MAX_CHARGE = 250
const CHARGE_RATE = 5
const MOVE_SPEED = 60
const TONGUE_RANGE = 112 // 7 blocks * 16 pixels per block

// --- Setup State ---
let lives = 3
let maxLives = 3
let lastX = 20
let lastY = 20
let isCharging = false
let chargeLevel = 0
let isGrappling = false
let tongueCount = 1

// --- Sprite Kinds ---
namespace SpriteKind {
    export const Bug = SpriteKind.create()
}

// --- Images ---
const frogIdle = img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . 7 7 7 . . . . . 7 7 7 . . . 
    . 7 7 1 1 7 7 7 7 7 1 1 7 7 . . 
    . 7 7 1 f 7 7 7 7 7 1 f 7 7 . . 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    7 7 3 3 7 7 7 7 7 7 7 3 3 7 7 . 
    7 7 3 3 7 7 7 7 7 7 7 3 3 7 7 . 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    7 7 7 7 7 6 6 6 6 6 7 7 7 7 7 . 
    . 7 7 7 7 7 7 7 7 7 7 7 7 7 . . 
    . . 7 7 . . . . . . . 7 7 . . . 
    . 7 7 7 . . . . . . . 7 7 7 . . 
    . . . . . . . . . . . . . . . . 
`
const frogCharging = img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
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
    . . . . . . . . . . . . . . . . 
    . . . . . . . b . . . . . . . . 
    . . . . . . b b b . . . . . . . 
    . . . . b b b b b b b . . . . . 
    . . . . . b b b b b . . . . . . 
    . . . . b b b b b b b . . . . . 
    . . . . b b . . . b b . . . . . 
`
const heartRed = img`. 2 2 . 2 2 . \n 2 2 2 2 2 2 2 \n . . 2 2 2 . .`
const heartGrey = img`. b b . b b . \n b b b b b b b \n . . b b b . .`

const flyImg = img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . 7 7 . . . . . . . 
    . . . . . . 7 a a 7 . . . . . . 
    . . . . . . 7 a a 7 . . . . . . 
    . . . . . . . 7 7 . . . . . . . 
`

// --- Init ---
let player = sprites.create(frogIdle, SpriteKind.Player)
player.ay = GRAVITY
player.setPosition(50, 50)
scene.cameraFollowSprite(player)
tiles.setCurrentTilemap(tilemap`level1`)
scene.setBackgroundColor(9)

let checkpointStar = sprites.create(starImg, SpriteKind.Food)
checkpointStar.setPosition(150, 100)

let fly = sprites.create(flyImg, SpriteKind.Bug)
fly.setPosition(100, 50)
fly.vx = 40
fly.setBounceOnWall(true)

// --- Helper: Distance Formula ---
// Uses Pythagorean theorem: $c = \sqrt{a^2 + b^2}$
function getDistance(s1: Sprite, s2: Sprite): number {
    let dx = s1.x - s2.x;
    let dy = s1.y - s2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// --- Grapple Action ---
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    // 1. Check if we have a use left
    if (tongueCount > 0) {
        // 2. Check if the Fly is within 7 blocks (TONGUE_RANGE)
        if (getDistance(player, fly) <= TONGUE_RANGE) {
            isGrappling = true
            tongueCount = 0
            music.pewPew.play()
        } else {
            // Visual feedback that the fly is too far
            player.sayText("Too far!", 500)
            music.thump.play()
        }
    }
})

controller.B.onEvent(ControllerButtonEvent.Released, function () {
    isGrappling = false
    player.ay = GRAVITY
})

// --- Logic ---
game.onUpdate(function () {
    let isGrounded = player.isHittingTile(CollisionDirection.Bottom)

    if (isGrounded && !isGrappling) {
        tongueCount = 1
    }

    if (isGrappling) {
        player.ay = 0
        player.vx = (player.x < fly.x) ? 120 : -120
        player.vy = (player.y < fly.y) ? 120 : -120

        // Safety: If fly moves away while grappling, break the line
        if (getDistance(player, fly) > TONGUE_RANGE + 20) {
            isGrappling = false
            player.ay = GRAVITY
        }
    } else {
        if (isGrounded) {
            player.vx = 0
            if (controller.A.isPressed()) {
                isCharging = true
                player.setImage(frogCharging)
                if (chargeLevel < MAX_CHARGE) chargeLevel += CHARGE_RATE
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
    }

    if (player.y > 240) {
        lives -= 1
        isGrappling = false
        tongueCount = 1
        if (lives <= 0) game.over(false)
        else {
            player.setPosition(lastX, lastY - 10)
            player.setVelocity(0, 0)
        }
    }
})

// Checkpoint Logic
sprites.onOverlap(SpriteKind.Player, SpriteKind.Food, function (sprite, otherSprite) {
    if (lastX != otherSprite.x) {
        lastX = otherSprite.x
        lastY = otherSprite.y
        otherSprite.image.replace(0xb, 0x5)
        music.baDing.play()
    }
})

// --- UI ---
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