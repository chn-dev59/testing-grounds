// Auto-generated code. Do not edit.
namespace myTiles {
    //% fixedInstance jres blockIdentity=images._tile
    export const transparency16 = image.ofBuffer(hex``);
    //% fixedInstance jres blockIdentity=images._tile
    export const tile1 = image.ofBuffer(hex``);
    //% fixedInstance jres blockIdentity=images._tile
    export const tile2 = image.ofBuffer(hex``);
    //% fixedInstance jres blockIdentity=images._tile
    export const tile3 = image.ofBuffer(hex``);
    //% fixedInstance jres blockIdentity=images._tile
    export const tile4 = image.ofBuffer(hex``);
    //% fixedInstance jres blockIdentity=images._tile
    export const tile5 = image.ofBuffer(hex``);

    helpers._registerFactory("tilemap", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "level1":
            case "level1":return tiles.createTilemap(hex`200010000400000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000040400000000000000000000000000000000000000000000000000000000000004040000000000000000000000000000000000000000000000000000000000000404000000000000000000000000000000000000000000000000000000000000040400000000000000000000000000000000000000000000000000000000000004040000000000000000000000000000000000000000000000000000000000000404010202030000000000000000000000000000000000000000000000000000040400000000000000000000000000000000000000000000000000000000000004040000000000000000000000000000000000000000000000000000000000000404000000000000000000000000000000000000000000000000000000000000040400000000000000000000000000000000000000000000000000000000000004040000000000000000000000000000000000000000000000000000000000000404000000000000000000000000000000000000000000000000000000000000040404040404040404040404040404040404040404040404040404040404040404`, img`
2...............................
2...............................
2..............................2
2..............................2
2..............................2
2..............................2
2..............................2
2..............................2
22222..........................2
2..............................2
2..............................2
2..............................2
2..............................2
2..............................2
2..............................2
22222222222222222222222222222222
`, [myTiles.transparency16,sprites.dungeon.darkGroundSouthWest0,sprites.dungeon.darkGroundSouth,sprites.dungeon.darkGroundSouthEast0,sprites.dungeon.floorMixed], TileScale.Sixteen);
        }
        return null;
    })

    helpers._registerFactory("tile", function(name: string) {
        switch(helpers.stringTrim(name)) {
            case "transparency16":return transparency16;
            case "tile1":return tile1;
            case "tile2":return tile2;
            case "tile3":return tile3;
            case "tile4":return tile4;
            case "tile5":return tile5;
        }
        return null;
    })

}
// Auto-generated code. Do not edit.
