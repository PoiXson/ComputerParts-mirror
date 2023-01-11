/* ==============================================================================
 * Copyright (c) 2021-2023 Mattsoft/PoiXson
 * <https://mattsoft.net> <https://poixson.com>
 * Released under the AGPL 3.0
 *
 * Description: Bootstrap script and common functions to run WorldEdit scripts
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
// pxn.js

importClass(Packages.com.sk89q.worldedit.WorldEdit);
importClass(Packages.com.sk89q.worldedit.world.block.BaseBlock);
importClass(Packages.com.google.common.io.CharStreams);
importClass(Packages.java.io.File);
importClass(Packages.java.nio.file.Files);
importClass(Packages.java.nio.file.FileSystems);



var options = {
	Debug: false,
	OriginProtect: true,
	Decor: false,
	Frame: false,
	Build: { },
};

let flags = {};

var taskQueue = [];
var task_count = 0;

var blocks_cached = {};
var blocks_alias  = {};
var blocks_cache_hits = 0;
var blocks_cache_miss = 0;

var origin        = null;
var select_world  = null;
var select_region = null;
var session       = null;

const worldedit = WorldEdit.getInstance();
const wePath =
	worldedit.getWorkingDirectoryFile(
		worldedit.getConfiguration().scriptsDir
	).toPath();



// block aliases
blocks_alias["|"]         = "wire ns";
blocks_alias["~"]         = "wire ew";
blocks_alias["wire ns"]   = "redstone_wire[power=0,north=side,south=side]";
blocks_alias["wire ew"]   = "redstone_wire[power=0,east=side,west=side]";
blocks_alias["torch"]     = "redstone_torch[lit=false]";
blocks_alias["torch lit"] = "redstone_torch[lit=true]";
blocks_alias["torch n"]   = "redstone_wall_torch[lit=false,facing=north]";
blocks_alias["torch s"]   = "redstone_wall_torch[lit=false,facing=south]";
blocks_alias["torch e"]   = "redstone_wall_torch[lit=false,facing=east]";
blocks_alias["torch w"]   = "redstone_wall_torch[lit=false,facing=west]";
blocks_alias["repeat n"]  = "repeater[facing=north]";
blocks_alias["repeat s"]  = "repeater[facing=south]";
blocks_alias["repeat e"]  = "repeater[facing=east]";
blocks_alias["repeat w"]  = "repeater[facing=west]";
blocks_alias["compars n"] = "comparator[mode=subtract,facing=north]";
blocks_alias["compars s"] = "comparator[mode=subtract,facing=south]";
blocks_alias["compars e"] = "comparator[mode=subtract,facing=east]";
blocks_alias["compars w"] = "comparator[mode=subtract,facing=west]";
blocks_alias["comparc n"] = "comparator[mode=compare,facing=north]";
blocks_alias["comparc s"] = "comparator[mode=compare,facing=south]";
blocks_alias["comparc e"] = "comparator[mode=compare,facing=east]";
blocks_alias["comparc w"] = "comparator[mode=compare,facing=west]";
blocks_alias["lamp"]      = "redstone_lamp";



// ==================================================
// common functions



function isNullOrEmpty(value) {
	if (!value)             return true;
	if (value == undefined) return true;
	if (value == "")        return true;
	if (value.length == 0)  return true;
	return false;
}



function printnl() {
	context.printRaw("");
}
function print(line) {
	if (isNullOrEmpty(line)) {
		printnl();
	} else {
		context.print(line);
	}
}
function error(line) {
	if (isNullOrEmpty(line)) {
		printnl();
	} else {
		context.error(line);
	}
}



function Trim(str, trim) {
	return TrimFront( TrimEnd(str, trim), trim);
}
function TrimFront(str, trim) {
	if (isNullOrEmpty(str) || isNullOrEmpty(trim))
		return str;
	let trim_len = trim.length;
	while (true) {
		if (str.length < trim_len) return str;
		if (!str.startsWith(trim)) return str;
		str = str.substring(trim_len);
	}
}
function TrimEnd(str, trim) {
	if (isNullOrEmpty(str) || isNullOrEmpty(trim))
		return str;
	let trim_len = trim.length;
	while (true) {
		if (str.length < trim_len)
			return str;
		if (!str.endsWith(trim))
			return str;
		str = str.substring(0, 0-trim_len);
	}
}



function ForceStartsWith(str, prepend) {
	if (isNullOrEmpty(str))      return str;
	if (str.startsWith(prepend)) return str;
	return prepend+str;
}
function ForceEndsWith(str, append) {
	if (isNullOrEmpty(str))   return str;
	if (str.endsWith(append)) return str;
	return str+append;
}



function ReplaceAt(str, index, replace) {
	return str.substr(0, index) + replace + str.substr(index+replace.length);
}



function toHex(value) {
	let str = toHexChar(value);
	if (str.length == 0) return "x00";
	if (str.length == 1) return "x0"+str;
	return "x"+str;
}
function toHexChar(value) {
	return value.toString(16).toUpperCase();
}



// ==================================================



// load/include a file
function loadjs(file) {
	file = ""+file;
	if (file.startsWith("/")
	||  file.includes("..") ) {
		error("error: Invalid file: "+file);
		return;
	}
	file = ForceEndsWith(file, ".js");
	if (options.Debug)
		print("Loading file: "+file);
	const f = FileSystems.getDefault().getPath(wePath, file);
	const reader = Files.newBufferedReader(f);
	return ""+CharStreams.toString(reader);
}



// task queue
function addTask(task) {
	if (typeof task == "function") {
		taskQueue.push(task);
	} else {
		error("error: Unknown task type: "+(typeof task));
	}
}
function hasQueuedTasks() {
	return (taskQueue.length > 0);
}
function doTasks() {
	while (hasQueuedTasks()) {
		let task = taskQueue.shift();
		if (typeof task == "function") {
			task_count++;
			try {
				if (!task()) {
					error("error: Task returned false");
					return false;
				}
			} catch (e) {
				error(e);
				return false;
			}
		}
	}
	return true;
}



// ==================================================
// block functions



// get origin block
function InitOrigin(block) {
	if (origin != null)
		return true;
	if (block == "player")
		block = null;
	// origin selected block
	if (block) {
		select_world  = context.getSession().getSelectionWorld();
		select_region = context.getSession().getSelection(select_world);
		origin = select_region.getMinimumPoint();
		return AssertSingleBlockSelected(block);
	// origin player
	} else {
		options.OriginProtect = false;
		origin = player.getBlockIn().toVector().toBlockPoint();
	}
	return true;
}

function AssertSingleBlockSelected(block) {
	if (isNullOrEmpty(block)) {
		error("error: Block type not provided for assert");
		return false;
	}
	block = ForceStartsWith(block, "minecraft:");
	// diamond key block
	if (!select_region
	|| select_region.getWidth()  != 1
	|| select_region.getLength() != 1
	|| select_region.getHeight() != 1) {
		error("error: Invalid selection");
		error("Select a diamond block as the center origin point for the computer");
		return false;
	}
	{
		let b = select_world.getBlock(origin);
		if (!b || b.getBlockType() != block) {
			error("error: Invalid block: "+b.getBlockType()+" != "+block);
			error("Select a diamond block as the center origin point for the computer");
			return false;
		}
	}
	return true;
}



// edit session
function StartSession() {
	if (session == null) {
		session = context.remember();
	}
}
function CloseSession() {
	if (session != null) {
		session.commit();
		session = null;
	}
}



function GetBlock(block) {
	if (isNullOrEmpty(block))
		return null;
	if (block instanceof BaseBlock)
		return block;
	type = TrimFront(""+block, "minecraft:");
	// block cache
	if (type in blocks_cached) {
		blocks_cache_hits++;
		return blocks_cached[type];
	}
	// block alias
	if (type in blocks_alias)
		return GetBlock(blocks_alias[type]);
	// newly referenced block
	{
		let blk = context.getBlock("minecraft:"+type);
		if (!blk) {
			error("error: Failed to match block type: "+type);
			return null;
		}
		blocks_cache_miss++;
		blocks_cached[type] = blk;
		return blk;
	}
}

function SetBlock(block, x, y, z) {
	// origin point
	if (options.OriginProtect
	&& x == 0 && y == 0 && z == 0)
		return;
	blk = GetBlock(block);
	if (isNullOrEmpty(blk))
		error("error: Block not found: "+block);
	session.setBlock(origin.add(x, y, z), blk);
}



function DrawFrame(block, x, y, z, w, h, d) {
	let blk = GetBlock(block);
	// bottom lines
	if (w < 0) { x += w+1; w = 0 - w; }
	if (h < 0) { y += h+1; h = 0 - h; }
	if (d < 0) { z += d+1; d = 0 - d; }
	// bottom lines
	for (let i=0; i<w; i++) SetBlock(blk, x+i,   y, z    );
	for (let i=0; i<d; i++) SetBlock(blk, x,     y, z+i  );
	for (let i=0; i<d; i++) SetBlock(blk, x+w-1, y, z+i  );
	for (let i=0; i<w; i++) SetBlock(blk, x+i,   y, z+d-1);
	// vertical lines
	for (let i=0; i<h; i++) SetBlock(blk, x,     y+i, z    );
	for (let i=0; i<h; i++) SetBlock(blk, x+w-1, y+i, z    );
	for (let i=0; i<h; i++) SetBlock(blk, x,     y+i, z+d-1);
	for (let i=0; i<h; i++) SetBlock(blk, x+w-1, y+i, z+d-1);
	// top lines
	for (let i=0; i<w; i++) SetBlock(blk, x+i,   y+h-1, z    );
	for (let i=0; i<d; i++) SetBlock(blk, x,     y+h-1, z+i  );
	for (let i=0; i<w; i++) SetBlock(blk, x+i,   y+h-1, z+d-1);
	for (let i=0; i<d; i++) SetBlock(blk, x+w-1, y+h-1, z+i  );
}



function SetBlockMatrix(blocks, matrix, x, y, z, axis) {
	if (isNullOrEmpty(blocks)) return;
	if (isNullOrEmpty(matrix)) return;
	if (isNullOrEmpty(axis))   return;
	const ax = axis.charAt(axis.length - 1);
	axis = axis.substr(0, axis.length -1);
	let xx=0, yy=0, zz=0;
	switch (ax) {
	case "x": xx = 1; break;
	case "X": xx =-1; break;
	case "y": yy = 1; break;
	case "Y": yy =-1; break;
	case "z": zz = 1; break;
	case "Z": zz =-1; break;
	default:
		error("error: Unknown SetBlock1 axis: "+ax);
		return;
	}
	const len = matrix.length;
	let ii;
	const matrix_last = (typeof matrix == "string");
	for (let i=0; i<len; i++) {
		ii = i;
		if (ax == "y" || ax == "Y")
			ii = len - i - 1;
		// last dimension
		if (matrix_last) {
			let blk = matrix.charAt(i);
			if (isNullOrEmpty(blk)) continue;
			if (blk == " ") continue;
			if (blk in blocks)
				blk = blocks[blk];
			SetBlock(blk, x+(i*xx), y+(i*yy), z+(i*zz));
		// another dimension
		} else {
			ii = ( ax=="y" || ax=="Y" ? len-i-1 : i );
			SetBlockMatrix(
				blocks,
				matrix[ii],
				x+(i*xx), y+(i*yy), z+(i*zz),
				axis
			);
		}
	}
}



function FillXYZ(block, x, y, z, w, h, d) {
	blk = GetBlock(block);
	if (w < 0) { x += w+1; w = 0 - w; }
	if (h < 0) { y += h+1; h = 0 - h; }
	if (d < 0) { z += d+1; d = 0 - d; }
	for (let yy=0; yy<h; yy++) {
		for (let zz=0; zz<d; zz++) {
			for (let xx=0; xx<w; xx++) {
				SetBlock(blk, xx+x, yy+y, zz+z);
			}
		}
	}
}



function DrawSpiral2x2(block, x, y, z, h, r, a) {
	if (h < 0) { y += h; h = 0 - h; }
	for (let i=0; i<h; i++) {
		DrawSpiral2x2_Y(block, x, y+i, z, r+i, a);
	}
}
function DrawSpiral2x2_Y(block, x, y, z, r, a) {
	r = (r % 4);
	if (a)
		r = 4 - r;
	if (block == "wire") {
		if (a) {
			switch (r) {
			case 1: block = "redstone_wire[south=side,west=up]"; break;
			case 2: block = "redstone_wire[west=side,north=up]"; break;
			case 3: block = "redstone_wire[north=side,east=up]"; break;
			default:block = "redstone_wire[east=side,south=up]"; break;
			}
		} else {
			switch (r) {
			case 1: block = "redstone_wire[west=side,south=up]"; break;
			case 2: block = "redstone_wire[north=side,west=up]"; break;
			case 3: block = "redstone_wire[east=side,north=up]"; break;
			default:block = "redstone_wire[south=side,east=up]"; break;
			}
		}
	}
	switch (r) {
	case 1: SetBlock(block, x+1, y, z  ); break;
	case 2: SetBlock(block, x+1, y, z+1); break;
	case 3: SetBlock(block, x,   y, z+1); break;
	default:SetBlock(block, x,   y, z  ); break;
	}
}



function BuildNAndGate(x, y, z, ns, ew, blocks) {
	let matrix = [
		[ "i~  ",  "    " ],
		[ "==/~",  "%   " ],
		[ " ! =",  "~=  " ],
		[ "i~=/",  "=   " ],
		[ "==  ",  "%   " ],
	];
	SetBlockMatrix(
		blocks,
		matrix,
		x, y, z,
		(ns ? "Z" : "z") + (ew ? "x" : "X") + "y"
	);
}
function BuildFullAdder(x, y, z, ns, ew, blocks) {
	// first adder
	BuildNAndGate(x, y, z, ns, ew, blocks);
	// fill between gates
	SetBlockMatrix(
		blocks,
		[
			[ "    ~~" ],
			[ "    xx" ],
			[ "      ",  " >X X~",  "    % " ],
			[ "      ",  " x~X x",  "   %  " ],
			[ "      ",  "  x   " ],
		],
		x, y-1, z,
		(ns ? "Z" : "z") + (ew ? "x" : "X") + "y"
	);
	// carry adder
	if (ns) z -= 6;
	else    z += 6;
	BuildNAndGate(x, y, z, ns, ew, blocks);
}
function getGateBlocks(ns, ew) {
	return {
		"~": "wire ns",
		"i": "torch",
		"/": (ns ? "torch n"  : "torch s" ),
		"%": (ew ? "torch e"  : "torch w" ),
		"!": (ew ? "torch w"  : "torch e" ),
		">": (ns ? "repeat s" : "repeat n"),
	};
}



// ==================================================



function DisplayHelp() {
	error("usage: /cs pxn <project> [flags]");
	printnl();
}



function CheckUnknownFlags() {
	for (let key in flags) {
		if (flags[key]) {
			error("error: Unknown flag: "+key);
			return false;
		}
	}
	return true;
}



addTask(function() { return main(); });
function main() {
	// flags
	if (argv.length < 2) {
		println();
		error("Argument is required");
		DisplayHelp();
		return false;
	}
	let filename = "";
	for (let i=1; i<argv.length; i++) {
		if (argv[i] == "help" || argv[i] == "?") {
			printnl();
			DisplayHelp();
			return false;
		}
		if (argv[i] == "debug") {
			options.Debug = true;
			continue;
		}
		if (i == 1) {
			// project file
			filename = argv[1]+"/"+argv[1]+".js";
			let f = new File(wePath+"/"+filename);
			if (!f.exists()) {
				error("error: File not found: "+f);
				return false;
			}
			continue;
		}
		flags[argv[i]] = true;
	}
	if (isNullOrEmpty(filename)) {
		printnl();
		DisplayHelp();
		return false;
	}
	// load project
	addTask(
		function() {
			eval(loadjs(filename));
			return CheckUnknownFlags();
		}
	);
	return true;
}



printnl();
doTasks();
CloseSession();
error("Tasks: "+task_count);
error("Unique Blocks: "+blocks_cache_miss);
error("Total Blocks: "+(blocks_cache_hits+blocks_cache_miss));
printnl();
