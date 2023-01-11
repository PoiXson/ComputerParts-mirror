/* ==============================================================================
 * Copyright (c) 2021-2023 Mattsoft/PoiXson
 * <https://mattsoft.net> <https://poixson.com>
 * Released under the AGPL 3.0
 *
 * Description: WorldEdit script to generate a redstone computer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * ==============================================================================
 */
// pxncomputer-progcount.js

// ---------------
//       BUS
// ---+-------+---
//    | PROG  |
//    | COUNT |
//    +-------+



options.ProgCount.w = (options.Bus.bits * 3) + 2;
options.ProgCount.d = 22;
options.ProgCount.x = getNextBusOffset(options.ProgCount.w, false);



function Clear_ProgCount() {
	let x = options.ProgCount.x;
	let w = options.ProgCount.w;
	let h = options.Bus.h + 3;
	let d = options.ProgCount.d;
	FillXYZ(
		"air",
		x, -3, 0,
		w,  h, d
	);
	return true;
}



function Frame_ProgCount() {
	const block_frame = GetBlock("frame");
	let x = options.ProgCount.x;
	let w = options.ProgCount.w;
	let h = options.Bus.h + 3;
	let d = options.ProgCount.d + 1;
	DrawFrame(
		block_frame,
		x, -3, 0,
		w,  h, d
	);
	return true;
}



// ==================================================



function Build_ProgCount() {
	print("Building the Program Counter..");
	let x = options.ProgCount.x + options.ProgCount.w;
	let y = 2;
	let z = 0;
	// bus branch feeds
	let func_x = function(bit) { return 0 - (bit * 3) - 3; };
	BuildBusBranch(x, false, true, "><", func_x);
	// full adder
	x = options.ProgCount.x + 2;
	BuildProgCountAdder(x, y, z);
	// registers
	BuildProgCountRegisters(x, y, z);
	return true;
}



function BuildProgCountRegisters(x, y, z) {
	let xx, yy, zz;
	let matrix;
	for (let bit=0; bit<options.Bus.bits; bit++) {
		xx = (x + options.ProgCount.w) - (bit * 3) - 5;
		matrix = [
			[ "   LS                  ",  "                       ",  "                       " ],
			[ "   =~~~  |             ",  "         |             ",  "         |             " ],
			[ "    --=~ - ~~~~~~~~~   ",  "         -             ",  "        %=             " ],
			[ "=~   | =<~~=-------=~  ",  "     |  ^              ",  "     |  |              " ],
			[ " =~  - ~---|        =~ ",  "     =~ -  |           ",  "     -  -  |           " ],
			[ "  =~   =~  -         -~",  "      =/  %=           ",  "           -           " ],
			[ "   =~ =C=~c~          =",  "       |  |            ",  "                       " ],
			[ "    =~~-----           ",  "       -  -            ",  "                       " ],
			[ "     -=>~c~            ",  "       ^ |             ",  "       |               " ],
			[ "      |---=~           ",  "      |- =             ",  "      |=               " ],
			[ "      -    -           ",  "      -  i             ",  "      -                " ],
			[ "           |           ",  "         =~|           ",  "           |           " ],
			[ "           -           ",  "          --           ",  "           -           " ],
		];
		SetBlockMatrix(
			{
				"=": "data block",
				"-": "data slab",
				"~": "wire ns",
				"|": "wire ew",
				"i": "torch",
				"/": "torch s",
				"%": "torch n",
				"^": "repeat w",
				">": "repeat n",
				"<": "repeat s",
				"c": "compars n",
				"C": "compars s",
				"L": "lamp",
				"S": "birch_wall_sign[facing=south]|Program Addr||"+
					"Bit "+(bit+1)+"|[+"+Math.pow(2, bit)+"]",
			},
			matrix,
			xx, y-5, z,
			"zXy"
		);
	}
	// floor fill
	if (options.Decor) {
		yy = options.Bus.h - 1;
		let w = options.ProgCount.w;
		let d = options.ProgCount.d + 1;
		let block, border, line;
		for (let iz=0; iz<d; iz++) {
			zz = z + iz;
			for (let ix=0; ix<w; ix++) {
				if (iz == 3 || iz == 4) {
					if (ix % 3 == 2)
						continue;
				}
				border = (
					ix == 0 || ix == w-1 ||
					iz == 0 || iz == d-1
				);
				line = (
					iz == 3 &&
					ix > 2 && ix < w-3 &&
					Math.floor(ix/3.0) % 4 != 0
				);
				xx = (x + ix) - 2;
				block = "wood " + (border ? "block" : "slab") + " " + (line||border ? "b" : "a");
				SetBlock(block, xx, yy, zz);
			}
		}
	}
}



function BuildProgCountAdder(x, y, z) {
	let blocks;
	let xx;
	for (let bit=0; bit<options.Bus.bits; bit++) {
		blocks = getGateBlocks(false, false);
		blocks["="] = "inst block";
		blocks["-"] = "inst slab";
		blocks["X"] = "data block";
		blocks["x"] = "data slab";
		xx = x + (bit * 3);
		BuildFullAdder(xx, y-2, z+12, false, false, blocks);
	}
}
