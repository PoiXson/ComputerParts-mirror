/* ==============================================================================
 * Copyright (c) 2021-2022 Mattsoft/PoiXson
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
// pxncomputer-display.js

//    +-------+
//    |       |
//    |  DSP  |
//    |       |
// ---+-------+---
//       BUS
// ---------------



options.Display.digits = Math.ceil(options.Bus.bits / 4);
options.Display.w = options.Display.digits * 8;
options.Display.h = 13;
options.Display.d = 38;
options.Display.bus_w = (options.Bus.bits * 2) + 1;
options.Display.bus_d = 30;
//TODO
options.Display.bus_offset = getNextBusOffset(options.Display.w+20, true);



function Stats_Display() {
	print("Dsp: "+options.Display.digits+" digits");
}



function Clear_Display() {
//TODO
	return true;
}



function Frame_Display() {
	const block_frame = GetBlock("frame");
	// bottom frame
	DrawFrame(
		block_frame,
		options.Display.bus_offset, options.Bus.h+2, -1,
		options.Display.w, options.Display.h, 0-options.Display.d
	);
	// top frame
	DrawFrame(
		block_frame,
		options.Display.bus_offset, options.Bus.h+options.Display.h+3, -1,
		options.Display.w, options.Display.h, 0-options.Display.d
	);
	// bus connection
	{
		const xx = Math.floor(options.Display.w/2) - Math.floor(options.Display.bus_w/2) + options.Display.bus_offset;
		DrawFrame(
			block_frame,
			xx, 0, 0,
			options.Display.bus_w, options.Bus.h, 0-options.Display.bus_d
		);
	}
	return true;
}



// ==================================================



function Build_Display() {
	print("Building the Display..");
	// data bus
	Build_Display_Screen(options.Display.bus_offset, options.Bus.h+2, -1);
	// instruct bus
	Build_Display_Screen(options.Display.bus_offset, options.Bus.h+options.Display.h+3, -1);
	return true;
}



function Build_Display_Screen(x, y, z) {
	// decor frame
	if (options.Decor) {
		const dsp_case_block = GetBlock("blackstone");
		// top
		FillXYZ(
			dsp_case_block,
			x, y+options.Display.h-1, z,
			options.Display.w, 1, -3
		);
		// bottom
		FillXYZ(
			dsp_case_block,
			x, y, z,
			options.Display.w, 1, -3
		);
		// west side
		FillXYZ(
			dsp_case_block,
			x, y+1, z,
			1, options.Display.h-2, -3
		);
		// east side
		FillXYZ(
			dsp_case_block,
			x+options.Display.w-1, y+1, z,
			1, options.Display.h-2, -3
		);
	} // end decor
	// screen
	for (let digit=0; digit<options.Display.digits; digit++) {
		let xx = x + (digit * 7) + 1
		Build_Display_Digit(xx, y+1, z);
	}
	return true;
}
function Build_Display_Digit(x, y, z) {
	SetBlockMatrix(
		{
			"x": "air",
			"X": "smooth_quartz",
			"~": "wire ew",
			"^": "repeat n",
			"<": "repeat e",
			"=": "byte block",
			"-": "byte slab",
			".": "snow_block",
			"P": "sticky_piston[facing=south]",
		},
		[
			[  ".......",  "       ",  "       ",  "  ~~~~~",  "      |",  "      |"  ],
			[  "..xxx..",  "  XXX  ",  "  PPP  ",  "  ===--",  "      -",  "      ="  ],
			[  ".x...x.",  " X   X ",  " P   P ",  " =   = ",  " ^   ^ ",  " |   ~ "  ],
			[  ".x...x.",  " X   X ",  " P   P ",  " |= =| ",  " =   = ",  " -   =|"  ],
			[  ".x...x.",  " X   X ",  " P   P ",  " =|~|= ",  " || |  ",  " |    -"  ],
			[  "..xxx..",  "  XXX  ",  "  PPP  ",  "  ===  ",  " -- -  ",  " -    |"  ],
			[  ".x...x.",  " X   X ",  " P   P ",  " =   = ",  " ^   ^ ",  " |   ~="  ],
			[  ".x...x.",  " X   X ",  " P   P ",  " |= =| ",  " =   = ",  " -   -~"  ],
			[  ".x...x.",  " X   X ",  " P   P ",  " =|~|= ",  "  | |~~",  "      ="  ],
			[  "..xxx..",  "  XXX  ",  "  PPP  ",  "  ===  ",  "  - ---",  "       "  ],
			[  ".......",  "       ",  "       ",  "       ",  "       ",  "       "  ],
		],
		x, y, z,
		"xZy"
	);
	// segment signal lines
	let xx, yy, zz;
	for (let seg=0; seg<7; seg++) {
		xx = x + 1;
		if (seg % 2 == 0) {
			xx += 5;
		}
		yy = y + seg + 2;
		for (let iz=0; iz<31; iz++) {
			zz = z - iz - 6;
			SetBlock("byte slab", xx, yy,   zz);
			SetBlock("wire ns",   xx, yy+1, zz);
		}
	}
	// segment signal towers
	const segments = {
		"0": "abcdef",
		"1": "bc",
		"2": "abdeg",
		"3": "abcdg",
		"4": "bcfg",
		"5": "acdfg",
		"6": "acdefg",
		"7": "abcdefg",
		"8": "abcdefg",
		"9": "abcdfg",
		"a": "abcefg",
		"b": "cdefg",
		"c": "adef",
		"d": "bcdeg",
		"e": "adefg",
		"f": "aefg",
	};
	let seg, seg_key;
	for (let digit=0; digit<16; digit++) {
		zz = z - (digit * 2) - 6;
		seg_key = digit.toString(16);
		seg = segments[seg_key];
		for (let iy=-1; iy<7; iy++) {
			xx = x + 3;
			if (iy % 2 == 0)
				xx++;
			yy = iy + y + 2;
			SetBlock("read slab", xx, yy, zz);
			SetBlock("~", xx, yy+1, zz);
			switch (iy) {
			case 0: if (!seg.includes("d")) continue; break;
			case 1: if (!seg.includes("e")) continue; break;
			case 2: if (!seg.includes("c")) continue; break;
			case 3: if (!seg.includes("g")) continue; break;
			case 4: if (!seg.includes("b")) continue; break;
			case 5: if (!seg.includes("f")) continue; break;
			case 6: if (!seg.includes("a")) continue; break;
			default: continue;
			}
			if (iy % 2 == 0) xx++;
			else             xx--;
			SetBlock("read slab", xx, yy,   zz);
			SetBlock("repeat "+(iy%2==0?"w":"e"),  xx, yy+1, zz);
		}
	}
/*
	for (let seg=0; seg<5; seg++) {
		for (let zz=0; zz<5; zz++) {
			let yy = (seg * 2) + 1;
			SetBlock("byte slab", x+5, y+yy,   z-zz-6);
			SetBlock("wire ns",   x+5, y+yy+1, z-zz-6);
		}
	}
	for (let seg=0; seg<5; seg++) {
		for (let zz=0; zz<5; zz++) {
			let yy = (seg * 2);
			SetBlock("byte slab", x+1, y+yy,   z-zz-6);
			SetBlock("wire ns",   x+1, y+yy+1, z-zz-6);
		}
	}
*/
}
