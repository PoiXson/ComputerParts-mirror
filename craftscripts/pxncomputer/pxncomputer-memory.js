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
// pxncomputer-memory.js

// +-----+-----+
// |     |     |
// | RAM | CTL |
// |     |     |
// +-----+-----*----
// |  MEM BUS  | BUS
// +-----+-----+----
// |     |     |
// | RAM | CTL |
// |     |     |
// +-----+-----+



// find memory size
options.Memory.pages     = 0;
options.Memory.page_part = 0;
{
	let size = options.Memory.size;
	while (size > 0) {
		if (size < options.Memory.page_size) {
			options.Memory.page_part = size;
			break;
		}
		options.Memory.pages++;
		size -= options.Memory.page_size;
	}
}
options.Memory.w = (options.Bus.bits * 3) + 2;
options.Memory.d = (Math.min(options.Memory.page_size, options.Memory.size) * 4) + 6;
options.Memory.h = 10;
options.Memory.bus_d = (options.Bus.bits * 3);
options.Memory.ctl_w = (options.Bus.bits * 3) + 2;



function Stats_Memory() {
	print("Mem: "+options.Memory.size);
}



function Clear_Memory() {
	let xx = 0 - options.Memory.ctl_w - options.Memory.w;
	let dd = 0 - options.Memory.bus_d - options.Memory.d;
	FillXYZ(
		"air",
		0, 0, options.Memory.bus_d,
		xx, options.Memory.h, dd
	);
	return true;
}



function Frame_Memory() {
	const block_frame = GetBlock("frame");
	let x, y, z, d;
	let m4, m8, ns;
	let pages = (options.Memory.page_part>0 ? options.Memory.pages+1 : options.Memory.pages);
	for (let page=0; page<pages; page++) {
		m4 = page % 4;
		m8 = page % 8;
		ns = (m8 < 4);
		x = 1 - options.Memory.ctl_w - ((options.Memory.w-1) * m4);
		z = (ns ? 1-options.Memory.bus_d : 0);
		y = Math.floor(page / 8.0) * (options.Memory.h-1);
		d = (ns ? 0-options.Memory.d : options.Memory.d);
		// memory bus
		if (m8 == 0) {
			DrawFrame(
				block_frame,
				0, y, 0,
				0-options.Memory.ctl_w, options.Memory.h, 0-options.Memory.bus_d
			);
		}
		// page bus
		if (ns) {
			DrawFrame(
				block_frame,
				x, y, 0,
				0-options.Memory.w, options.Memory.h, 0-options.Memory.bus_d
			);
		}
		// memory control
		if (m4 == 0) {
			DrawFrame(
				block_frame,
				0, y, z,
				0-options.Memory.ctl_w, options.Memory.h, d
			);
		}
		// memory page
		DrawFrame(
			block_frame,
			x, y, z,
			0-options.Memory.w, options.Memory.h, d
		);
	}
	return true;
}



// ==================================================



function Build_Memory() {
	print("Building the Memory..");
	let x, y, z, d;
	let m4, m8, ns;
	let pages = (options.Memory.page_part>0 ? options.Memory.pages+1 : options.Memory.pages);
	let pageLevel = 0;
	let hasPageAbove;
	for (let page=0; page<pages; page++) {
		m4 = page % 4;
		m8 = page % 8;
		ns = (m8 < 4);
		if (m8 == 0 && page > 0)
			pageLevel++;
		x = 1 - options.Memory.ctl_w - ((options.Memory.w-1) * m4);
		z = (ns ? 1-options.Memory.bus_d : 0);
		y = Math.floor(page / 8.0) * (options.Memory.h-1);
		d = (ns ? 0-options.Memory.d : options.Memory.d);
		hasPageAbove = (Math.floor((pages-1)/8.0) > pageLevel);
		// memory bus
		if (m8 == 0)
			BuildMemoryBus(y, pageLevel, hasPageAbove);
		// page bus
		if (ns)
			BuildMemoryPageBus(x, y, z);
		// memory output gates
		BuildMemoryOutGates(x, y, z, ns);
		// memory control
		if (m4 == 0)
			BuildMemoryControl(y, z);
		// memory page
		BuildMemoryPage(x, y, z, page);
	}
	return true;
}



function BuildMemoryBus(y, pageLevel, hasPageAbove) {
	let xx, zz;
	for (let bit=0; bit<options.Bus.bits; bit++) {
		let tib = options.Bus.bits - bit - 1;
		// system bus links
		zz = 0 - (bit * 3) - 1;
		let ix = (
			pageLevel > 0
			? (tib * 3) + 2
			: 1
		);
		for (; ix<options.Memory.ctl_w; ix++) {
			xx = 0 - ix;
			SetBlock("data slab", xx, y+5, zz);
			// repeater
			if (tib > 0) {
				if (ix == (tib * 3) + 1) {
					SetBlock("repeat w", xx, y+6, zz);
					continue;
				}
				if (ix == (tib * 3)) {
					SetBlock("repeat e", xx, y+6, zz);
					continue;
				}
			}
			SetBlock("wire ew", xx, y+6, zz);
		}
		// memory address bus offshoots
		xx = 0 - (tib * 3) - 2;
		BuildBusBranchBit(xx, y+5, bit, true,  true);
		BuildBusBranchBit(xx, y+5, bit, false, true);
		// spiral between page levels
		if (hasPageAbove) {
			xx = 0 - (tib * 3) - 3;
			let zz = (tib * 3) - options.Memory.bus_d;
			let r = 0;
			let last = (tib == 0);
			if (last) {
				zz += 3;
				r = 3;
			}
			DrawSpiral2x2("cell block", xx, y+8, zz, options.Memory.h-4, r, !last);
			DrawSpiral2x2("wire",       xx, y+9, zz, options.Memory.h-4, r, !last);
		}
		// connect to spiral below
		if (pageLevel > 0) {
			xx = 0 - (tib * 3) - 3;
			zz = 0 - (bit * 3) - 1;
			SetBlock("cell block", xx, y+5, zz);
		}
	} // end bits
}



function BuildMemoryPageBus(x, y, z) {
	let xx, zz;
	for (let bit=0; bit<options.Bus.bits; bit++) {
		let tib = options.Bus.bits - bit - 1;
		zz = z + (bit * 3) + 1;
		for (let ix=1; ix<options.Memory.w; ix++) {
			xx = (x - ix);
			SetBlock("data slab", xx, y+5, zz);
			SetBlock("wire ew",   xx, y+6, zz);
		}
		// memory page bus offshoots
		xx = x - (tib * 3) - 2;
		BuildBusBranchBit(xx, y+5, bit, true,  true);
		BuildBusBranchBit(xx, y+5, bit, false, true);
	}
}

function BuildMemoryOutGates(x, y, z, ns) {
	let blocks = {
		"i": "torch",
		"^": "repeat " +(ns ? "n" : "s"),
		"C": "compars "+(ns ? "n" : "s"),
		"=": "byte block",
		"-": "byte slab",
		"_": "data slab",
		"+": "data block",
		"L": (options.Decor ? "lamp"        : "air"),
		"W": (options.Decor ? "lamp base"   : "lamp"),
		".": (options.Decor ? "wood slab a" : "air"),
		",": (options.Decor ? "wood slab c" : "air"),
	};
	let matrix = [
		[  "......",  ",L,,L,",  "......"  ],
		[  " C~~C ",  " W  W ",  " ^  ^ "  ],
		[  " _=-_ ",  " _  _ ",  " _  _ "  ],
		[  "  i   ",  "      ",  "      "  ],
		[  "  =   ",  "      ",  "      "  ],
	];
	let zz = (ns ? z-1 : z+1);
	for (let bit=0; bit<options.Bus.bits; bit+=2) {
		xx = x - (bit * 3) - 1;
		SetBlockMatrix(
			blocks,
			matrix,
			xx, y+4, zz,
			(ns ? "XZy" : "Xzy")
		);
	}
}



function BuildMemoryControl(y, z) {
}



function BuildMemoryPage(x, y, z, page) {
	let ns = ((page % 8) < 4);
	let byt = page * 32;
	let zz;
	for (let ib=0; ib<32; ib++) {
		byt++;
		if (byt > options.Memory.size)
			break;
		zz = (
			ns
			? z - (ib * 4) - 4
			: z + (ib * 4) + 4
		);
		BuildMemoryByteRow(x, y+6, zz, byt, ns);
	}
//TODO
//	BuildMemoryBlockDataInFeeds(x, y, z);
//	// data output register
//	BuildMemoryBlockInOutRegisters(x, y+5,  z, false);
//	// data input register
//	BuildMemoryBlockInOutRegisters(x, y+11, z-1, true);
}

// memory row (1 byte)
function BuildMemoryByteRow(x, y, z, byt, ns) {
	let xx;
	for (let bit=0; bit<options.Bus.bits; bit+=2) {
		xx = x - ((bit * 3) + 1);
//TODO
		// read/write signal lines
//		BuildMemoryReadWriteLines(xx, y, z-1, bit, true);
//		BuildMemoryReadWriteLines(xx, y, z-3, bit, false);
		// memory cell (2 bits)
		BuildMemoryCell(xx, y, z, byt, bit, ns);
	}
}

// memory cell (2 bits)
function BuildMemoryCell(x, y, z, byt, bit, ns) {
	const islast  = (bit >= options.Bus.bits-2);
	const blocks = {
		"r": "repeat e",
		"R": "repeat w",
		"l": "repeat " +(ns ? "n" : "s"),
		"C": "compars "+(ns ? "n" : "s"),
		"-": "cell slab",
		"=": "cell block",
		"_": "byte slab",
		"+": "byte block",
		"L": (options.Decor ? "lamp"        : "air" ),
		"x": (options.Decor ? "lamp base"   : "lamp"),
		".": (options.Decor ? "wood slab a" : "air" ),
		",": (options.Decor ? "wood slab b" : "air" ),
		":": (options.Decor ? "wood block a" : "cell block" ),
		";": (options.Decor ? "wood slab b"  : "cell slab"  ),
	};
	let matrix = [
		[  "      ",  "  | | ",  "  | | ",  "  | | "  ],
		[  "..|.|.",  "..:.:.",  ",L;,;L",  "..:.:."  ],
		[  " |= =|",  " CR~rC",  " x   x",  " lR~rl"  ],
		[  " -- --",  " --+--",  " -   -",  " --+--"  ],
	];
	SetBlockMatrix(
		blocks,
		matrix,
		x, y, z,
		(ns ? "XZy" : "Xzy")
	);
//TODO
//	// end of last byte
//	SetBlockMatrix(
//		blocks,
//		[
//			matrix[1][0],
//			matrix[2][0],
//			matrix[3][0],
//		],
//		x-5, y+5, z-4,
//		"xy"
//	);
//	// byte signs
//	if (options.Decor) {
//		// east sign
//		if (bit == 0) {
//			SetBlock(
//				"birch_wall_sign[facing=east]|"+
//				"Byte "+byt+"|"+toHex(byt)+"||low-end",
//				x+1, y+7, z-2
//			);
//		} else
//		// west sign
//		if (islast) {
//			SetBlock(
//				"birch_wall_sign[facing=west]|"+
//				"Byte "+byt+"|"+toHex(byt)+"||high-end",
//				x-6, y+7, z-2
//			);
//		}
//	}
//	// trim the decor
//	if (options.Decor && byt == 0) {
//		SetBlock("air", x,   y+7, z);
//		SetBlock("air", x-2, y+7, z);
//		SetBlock("air", x-4, y+7, z);
//		SetBlock("air", x-5, y+7, z);
//	}
}



/*
function BuildMemoryBlockInOutRegisters(x, y, z, inout) {
//	for (let bit=0; bit<options.Bus.bits; bit+=2) {
//		let xx = x - (bit * 3) - 1;
//		SetBlockMatrix(
//			{
//				"~": "wire ew",
//				"!": inout ? "repeat s" : "repeat n",
//				">": "repeat e",
//				"<": "repeat w",
//				"C": inout ? "compars s" : "compars n",
//				"=": "data block",
//				"-": "data slab",
//			},
//			[
//				[ " C~C ",  ">! !<" ],
//				[ " -=- ",  "-- --" ],
//			],
//			xx, y, z,
//			inout ? "Xzy" : "XZy"
//		);
//	}
}



// read/write signal lines
function BuildMemoryReadWriteLines(x, y, z, bit, rw) {
/ *
	const first = (bit == 0);
	const last  = (bit >= options.Bus.bits-2);
	const boost = (((bit / 2) % 2) == 1);
	let blocks = {
		"i": "torch",
		"r": "repeat e",
	};
	if (rw) {
		blocks["="] = "read block";
		blocks["-"] = "read slab";
		blocks["t"] = "read tower";
	} else {
		blocks["="] = "write block";
		blocks["-"] = "write slab";
		blocks["t"] = "write tower";
	}
	let matrix;
	if (first) {
		matrix = [
			"   t  ",
			"   i  ",
			"   t  ",
			"~~~~= ",
			"----  ",
			"      ",
		];
	} else
	if (last) {
		matrix = [
			"   t  ",
			"   i  ",
			"   t~ ",
			"    =~",
			"    --",
			"      ",
		];
	} else
	if (boost) {
		matrix = [
			"   t  ",
			"   i  ",
			"   tr~",
			"~~~~==",
			"------",
			"      ",
		];
	} else {
		matrix = [
			"   t  ",
			"   i  ",
			"   t~ ",
			"~~~~-~",
			"---=~=",
			"    - ",
		];
	}
	SetBlockMatrix(
		blocks,
		matrix,
		x-5, y, z,
		"xy"
	);
* /
}



function BuildMemoryBlockDataInFeeds(x, y, z) {
//	const z_end = z - ((options.Memory.size < 3 ? 3 : options.Memory.size - 3) * 4) - 4;
//	for (let bit=0; bit<options.Bus.bits; bit++) {
//		let xx = x - (bit * 3) + (bit % 2) - 2;
//		BuildMemoryBlockDataInFeedBit(xx, y+11, z, bit);
//	}
}
function BuildMemoryBlockDataInFeedBit(x, y, z, bit) {
/ *
	const blocks = {
		"~": "wire ns",
		"/": "torch n",
		"=": "data block",
		"-": "data slab",
	};
	const len = options.Memory.d - 14;
	const ioff = (
		len % 32 < 8
		? (len % 32) * 2
		: 0
	);
	for (let i=0; i<len; i++) {
		let zz = z - i - 2;
		let mod = (
			i >= len - 1
			? 4
			: (i - ioff) % 32
		);
		switch (mod) {
		// drop-feed
		case 4:
			i++;
			SetBlockMatrix(
				blocks,
				[
					"~   ",
					"=~  ",
					" =~ ",
					"  =/",
				],
				x, y-2, zz,
				"Zy"
			);
			// repeater under drop-feed
			SetBlock("repeat n", x, y-3, zz-2);
			break;
		case 10:
		case 26:
			SetBlock("data slab", x, y,   zz);
			SetBlock("repeat s", x, y+1, zz);
			break;
		case 22:
			SetBlock("repeat n", x, y-3, zz);
		default:
			SetBlock("data slab", x, y,   zz);
			SetBlock("wire ns",   x, y+1, zz);
			break;
		}
		// invert the feed
		if (i == 0) {
			SetBlock("stone", x, y+1, zz);
		} else
		if (i == 1) {
			SetBlock("torch n", x, y+1, zz);
		}
	}
* /
}



function BuildMemoryControl(x, y, z) {
//	for (let byt=0; byt<options.Memory.size; byt++) {
//		BuildMemoryAddressDecoderRow(x, y, z, byt);
//	}
//	BuildMemoryAddressRegister(x, y, z);
}



function BuildMemoryAddressDecoderRow(x, y, z, byt) {
/ *
	const last = (byt >= options.Memory.size-1);
	const zz = z - (byt * 4) - 5;
	// byte r/w select gate
	matrix = [
		[  "      ", "      ",  "  ~~  ",  "      "  ],
		[  "      ", "      ",  "=!=-  ",  "      "  ],
		[  "      ", "C~~~  ",  "|-    ",  "C~    "  ],
		[  "      ", "GggG~ ",  "-     ",  "RR~   "  ],
		[  "   | |", "   |G|",  "   | |",  "  R| |"  ],
		[  "   r g", "   r g",  "   r g",  "   r g"  ],
	];
	if (last) {
		// cut red short
		matrix[4][1] = ReplaceAt(matrix[4][1], 3, " ");
		matrix[5][1] = ReplaceAt(matrix[5][1], 3, " ");
		matrix[4][2] = ReplaceAt(matrix[4][2], 3, " ");
		matrix[5][2] = ReplaceAt(matrix[5][2], 3, " ");
		// cut green short
		matrix[4][0] = ReplaceAt(matrix[4][0], 3, "   ");
		matrix[5][0] = ReplaceAt(matrix[5][0], 3, "   ");
	}
	SetBlockMatrix(
		{
			"!": "repeat e",
			"C": "compars e",
			"=": "byte block",
			"-": "byte slab",
			"G": "read block",
			"g": "read slab",
			"R": "write block",
			"r": "write slab",
		},
		matrix,
		x-options.Memory.ctl_w-2, y, zz-1,
		"xzy"
	);
	// byte select line
	{
		const len = options.Memory.ctl_w - 1;
		for (let xx=0; xx<len; xx++) {
			SetBlock("byte slab", x-xx, y+4, zz+1);
			SetBlock("wire ew",   x-xx, y+5, zz+1);
		}
	}
	// byte select signal lamp
	{
		let xx = x - options.Memory.ctl_w;
		SetBlockMatrix(
			{
				"/": "torch w",
				"L": "lamp",
				"=": "byte block",
				"-": "byte slab",
			},
			[
				[  "  ",  "  ",  "L "  ],
				[  "| ",  "| ",  "L "  ],
				[  "= ",  "- ",  "  "  ],
				[  "/=",  " |",  "  "  ],
				[  "  ",  " -",  "  "  ],
			],
			xx+1, y+4, zz-1,
			"xzy"
		);
		// eastern lamp sign
		SetBlock(
			"birch_wall_sign[facing=east]|Byte "+byt+"|"+toHex(byt),
			xx+2, y+8, zz+1
		);
		// western lamp sign
		SetBlock(
			"birch_wall_sign[facing=west]|Byte "+byt+"|"+toHex(byt),
			xx, y+8, zz+1
		);
	}
	// byte select decoder
	{
		const num_bits = Math.min(4, options.Bus.bits);
		let matrix = [];
		for (let bit=0; bit<num_bits; bit++) {
			let xx = options.Memory.ctl_w - (bit * 3) - ((bit+1) % 2) - 2;
			let io = (byt & Math.pow(2, bit));
			if (io) {
				matrix = [
					"    ",
					"||||",
					"-G--",
					"    ",
					"    ",
				];
			} else {
				matrix = [
					" || ",
					"|R=|",
					"-R!=",
					"  - ",
					"    ",
				];
			}
			// booster
			if ((byt % 4) == 3) {
				if (io) {
					matrix[1] = ReplaceAt(matrix[1], 2, "!");
				} else {
					matrix[0] = ReplaceAt(matrix[0], 1, " ");
					matrix[1] = ReplaceAt(matrix[1], 1, "|");
					matrix[0] = ReplaceAt(matrix[0], 2, " ");
					matrix[1] = ReplaceAt(matrix[1], 2, " ");
				}
			}
			SetBlockMatrix(
				{
					"!": "repeat s",
					"=": "data block",
					"-": "data slab",
					"G": "read tower",
					"R": "write tower",
				},
				matrix,
				x-xx, y+4, zz,
				"zy"
			);
			// torch on side
			if (io) {
				if ((bit % 2) == 0 || !options.Decor) {
					// western torch
					SetBlock("torch w", x-xx-1, y+6, zz+1);
				} else {
					// eastern torch
					SetBlock("torch e", x-xx+1, y+6, zz+1);
				}
			}
			// decor fill between bits
			if (options.Decor && (bit % 2) == 1) {
				for (let i=0; i<4; i++) {
					if (i >= 3 && byt >= options.Memory.size-1)
						break;
					SetBlock("wood slab "+(i==1?"b":"a"), x-xx-1, y+6, zz-i+2);
				}
			}
		}
	} // end byte select decoder
* /
}



// memory address register
function BuildMemoryAddressRegister(x, y, z) {
/ *
	for (let bit=0; bit<options.Bus.bits; bit+=2) {
		let xx = x - options.Memory.ctl_w + (bit * 3) + 2;
		let matrix = [
			[  "L   L ",  "      ",  "      "  ],
			[  "W   W ",  "lr~Rl ",  "|   | "  ],
			[  "_ . _.",  "_-=-_.",  "_..._."  ],
			[  "      ",  "  i   ",  "      "  ],
			[  "      ",  "  =   ",  "      "  ],
		];
		if (bit == 0) {
			matrix[2][2] = ReplaceAt(matrix[2][2], 0, "+");
		}
		if (bit >= options.Bus.bits-2) {
			matrix[2][0] = ReplaceAt(matrix[2][0], 5, " ");
			matrix[2][1] = ReplaceAt(matrix[2][1], 5, " ");
			matrix[2][2] = ReplaceAt(matrix[2][2], 5, " ");
		}
		SetBlockMatrix(
			{
				"l": "repeat s",
				"r": "repeat e",
				"R": "repeat w",
				"i": "torch",
				"/": "torch s",
				"=": "byte block",
				"-": "byte slab",
				"+": "data block",
				"_": "data slab",
				"L": (options.Decor ? "lamp"        : "air"),
				"W": (options.Decor ? "lamp base"   : "lamp"),
				".": (options.Decor ? "wood slab a" : "air"),
				",": (options.Decor ? "wood slab b" : "air"),
			},
			matrix,
			xx, y+4, z-2,
			"xzy"
		);
	}
* /
}
*/
