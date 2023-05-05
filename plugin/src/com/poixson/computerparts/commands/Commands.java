package com.poixson.computerparts.commands;

import com.poixson.commonmc.tools.commands.pxnCommandsHandler;
import com.poixson.computerparts.ComputerPartsPlugin;


public class Commands extends pxnCommandsHandler<ComputerPartsPlugin> {



	public Commands (final ComputerPartsPlugin plugin) {
		super(plugin,
			"comp",
			"computer",
			"computerparts",
			"parts"
		);
		this.addCommand(new Command_Blink(plugin));
	}



}
