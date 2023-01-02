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
// pxncomputer-diskio.js

//    +------+
//    |  IO  |
// ---+------+---
//      BUS
// --------------



options.DiskIO.w = (options.Bus.bits * 2) + 2
options.DiskIO.h = options.Bus.h
options.DiskIO.bus_d = 5;
options.DiskIO.bus_offset = getNextBusOffset(options.DiskIO.w, true);



function Clear_DiskIO() {
//TODO
	return true;
}



function Frame_DiskIO() {
/*
	const block_frame = GetBlock("frame");
	DrawFrame(
		block_frame,
		options.DiskIO.bus_offset, options.Bus.h+2, -1,
		options.DiskIO.w, options.DiskIO.h, 0-options.DiskIO.bus_d
	);
	// bus connection
	{
		const xx = Math.floor(options.Monitor.w/2) - Math.floor(options.Monitor.bus_w/2) + options.Monitor.bus_offset;
		DrawFrame(
			block_frame,
			xx, 0, 0,
			options.Monitor.bus_w, options.Bus.h, 0-options.Monitor.bus_d
		);
	}
*/
	return true;
}



// ==================================================



function Build_DiskIO() {
	print("Building the Disk IO..");
	Build_DiskIO_Bits();
	return true;
}



function Build_DiskIO_Bits() {
	for (let bit=0; bit<options.Bus.bits; bit++) {
		Build_DiskIO_Bit(bit);
	}
}

function Build_DiskIO_Bit(bit) {
}
