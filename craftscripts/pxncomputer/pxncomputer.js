/* ==============================================================================
 * Copyright (c) 2021-2022 Mattsoft/PoiXson
 * <https://mattsoft.net> <https://poixson.com>
 * Released under the AGPL 3.0
 *
 * Description: WorldEdit script to generate a redstone computer
 *
 * Usage: /cs pxncomputer <options>
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
// pxncomputer.js

// +-----+
// |     |
// |     |
// |     *---------------+
// | MEM |      BUS      |
// |     +---------------+
// |     |
// |     |
// +-----+



// block aliases
blocks_alias["frame"]        = "black_stained_glass";
blocks_alias["lamp base"]    = "light_gray_wool";
blocks_alias["wood block a"] = "dark_oak_planks";
blocks_alias["wood block b"] = "spruce_planks";
blocks_alias["wood block c"] = "birch_planks";
blocks_alias["wood slab a"]  = "dark_oak_slab[type=top]";
blocks_alias["wood slab b"]  = "spruce_slab[type=top]";
blocks_alias["wood slab c"]  = "birch_slab[type=top]";
blocks_alias["data block"]   = "andesite";
blocks_alias["data slab"]    = "andesite_slab[type=top]";
blocks_alias["inst block"]   = "diorite";
blocks_alias["inst slab"]    = "diorite_slab[type=top]";
blocks_alias["cell block"]   = "polished_andesite";
blocks_alias["cell slab"]    = "polished_andesite_slab[type=top]";
blocks_alias["read block"]   = "warped_planks";
blocks_alias["read slab"]    = "warped_slab[type=top]";
blocks_alias["read tower"]   = "green_terracotta";
blocks_alias["write block"]  = "polished_granite";
blocks_alias["write slab"]   = "polished_granite_slab[type=top]";
blocks_alias["write tower"]  = "red_terracotta";
blocks_alias["byte block"]   = "dark_prismarine";
blocks_alias["byte slab"]    = "dark_prismarine_slab[type=top]";



options.Build.Bus       = false;
options.Build.Memory    = false;
options.Build.Keypad    = false;
options.Build.ProgCount = false;
options.Build.Display   = false;
options.Build.Monitor   = false;
options.Build.DiskIO    = false;

options.Bus = {
	bits: 8,
	inst: 8,
	spacing: 2,
	next_n: 0,
	next_s: 0,
};
options.Memory = {
	size: 16,
	page_size: 32,
};
options.Keypad    = { };
options.ProgCount = { };
options.Display   = { };
options.Monitor = {
	size_x: 8,
	size_y: 8,
	bits: 0,
};
options.DiskIO = { };



// flag aliases
if (flags["mem"           ]) { flags["mem"           ] = null; flags["memory"   ] = true; }
if (flags["key"           ]) { flags["key"           ] = null; flags["keypad"   ] = true; }
if (flags["dsp"           ]) { flags["dsp"           ] = null; flags["display"  ] = true; }
if (flags["mon"           ]) { flags["mon"           ] = null; flags["monitor"  ] = true; }
if (flags["prg"           ]) { flags["prg"           ] = null; flags["progcount"] = true; }
if (flags["prgcount"      ]) { flags["prgcount"      ] = null; flags["progcount"] = true; }
if (flags["progcount"     ]) { flags["progcount"     ] = null; flags["progcount"] = true; }
if (flags["progcounter"   ]) { flags["progcounter"   ] = null; flags["progcount"] = true; }
if (flags["programcount"  ]) { flags["programcount"  ] = null; flags["progcount"] = true; }
if (flags["programcounter"]) { flags["programcounter"] = null; flags["progcount"] = true; }
if (flags["disk"          ]) { flags["disk"          ] = null; flags["diskio"   ] = true; }
if (flags["fancy"         ]) { flags["fancy"         ] = null; flags["decor"    ] = true; }
// flags
if (flags["clear"   ]) { flags["clear"   ] = null; options.Clear = true;  }
if (flags["frame"   ]) { flags["frame"   ] = null; options.Frame = true;  }
if (flags["decor"   ]) { flags["decor"   ] = null; options.Decor = true;  }
if (flags["no-decor"]) { flags["no-decor"] = null; options.Decor = false; }
if (flags["all"]) {
	flags["all"] = null;
	options.Build.Bus       = true;
	options.Build.Memory    = true;
	options.Build.Keypad    = true;
	options.Build.ProgCount = true;
	options.Build.Display   = true;
	options.Build.Monitor   = true;
	options.Build.DiskIO    = true;
} else {
	if (flags["bus"      ]) { flags["bus"      ] = null; options.Build.Bus       = true; }
	if (flags["memory"   ]) { flags["memory"   ] = null; options.Build.Memory    = true; }
	if (flags["keypad"   ]) { flags["keypad"   ] = null; options.Build.Keypad    = true; }
	if (flags["progcount"]) { flags["progcount"] = null; options.Build.ProgCount = true; }
	if (flags["display"  ]) { flags["display"  ] = null; options.Build.Display   = true; }
	if (flags["monitor"  ]) { flags["monitor"  ] = null; options.Build.Monitor   = true; }
	if (flags["diskio"   ]) { flags["diskio"   ] = null; options.Build.DiskIO    = true; }
}



eval(loadjs("pxncomputer/pxncomputer-bus"      ));
eval(loadjs("pxncomputer/pxncomputer-memory"   ));
eval(loadjs("pxncomputer/pxncomputer-keypad"   ));
eval(loadjs("pxncomputer/pxncomputer-progcount"));
eval(loadjs("pxncomputer/pxncomputer-display"  ));
eval(loadjs("pxncomputer/pxncomputer-monitor"  ));
eval(loadjs("pxncomputer/pxncomputer-diskio"   ));



addTask(function() {
	// ensure single block selected
	if (!InitOrigin("diamond_block"))
		return false;
	return true;
});



addTask(function() {
	let did_something = false;
	StartSession();
	// clear area
	if (options.Clear) {
		print("Clearing Build Area..");
		if (options.Build.Bus      ) { Clear_Bus();       did_something = true; }
		if (options.Build.Memory   ) { Clear_Memory();    did_something = true; }
//		if (options.Build.Keypad   ) { Clear_Keypad();    did_something = true; }
//		if (options.Build.ProgCount) { Clear_ProgCount(); did_something = true; }
//		if (options.Build.Display  ) { Clear_Display();   did_something = true; }
//		if (options.Build.Monitor  ) { Clear_Monitor();   did_something = true; }
//		if (options.Build.DiskIO   ) { Clear_DiskIO();    did_something = true; }
	}
	// draw frames
	if (options.Frame) {
		print("Building Frames..");
		if (options.Build.Bus      ) Frame_Bus();
		if (options.Build.Memory   ) Frame_Memory();
//		if (options.Build.Keypad   ) Frame_Keypad();
//		if (options.Build.ProgCount) Frame_ProgCount();
//		if (options.Build.Display  ) Frame_Display();
//		if (options.Build.Monitor  ) Frame_Monitor();
//		if (options.Build.DiskIO   ) Frame_DiskIO();
	}
	// display some stats
	if (options.Build.Bus
	||  options.Build.Memory
	||  options.Build.Keypad
	||  options.Build.ProgCount
	||  options.Build.Display
	||  options.Build.Monitor
	||  options.Build.DiskIO ) {
		Stats_Bus();
		if (options.Build.Memory ) Stats_Memory();
		if (options.Build.Display) Stats_Display();
		if (options.Build.Monitor) Stats_Monitor();
	}
	// build computer
	if (options.Build.Bus      ) { addTask(function() { return Build_Bus();       }); did_something = true; }
	if (options.Build.Memory   ) { addTask(function() { return Build_Memory();    }); did_something = true; }
//	if (options.Build.Keypad   ) { addTask(function() { return Build_Keypad();    }); did_something = true; }
//	if (options.Build.ProgCount) { addTask(function() { return Build_ProgCount(); }); did_something = true; }
//	if (options.Build.Display  ) { addTask(function() { return Build_Display();   }); did_something = true; }
//	if (options.Build.Monitor  ) { addTask(function() { return Build_Monitor();   }); did_something = true; }
//	if (options.Build.DiskIO   ) { addTask(function() { return Build_DiskIO();    }); did_something = true; }
	if (!did_something) {
		printnl();
		error("Nothing to do..");
		DisplayHelp();
	}
	return true;
});
