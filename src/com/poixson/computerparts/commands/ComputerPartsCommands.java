package com.poixson.computerparts.commands;

import java.util.ArrayList;
import java.util.List;

import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;

import com.poixson.commonbukkit.tools.commands.pxnCommandsHandler;
import com.poixson.computerparts.ComputerPartsPlugin;


public class ComputerPartsCommands extends pxnCommandsHandler {



	public ComputerPartsCommands (final ComputerPartsPlugin plugin) {
		super(
			plugin,
			"computer",
			"computerparts",
			"parts"
		);
		this.addCommand(new CommandBlink(plugin));
	}



	@Override
	public List<String> onTabComplete(
			final CommandSender sender, final Command cmd,
			final String label, final String[] args) {
		final List<String> matches = new ArrayList<String>();
		final int size = args.length;
		switch (size) {
		case 1:
			if ("blink".startsWith(args[0])) matches.add("blink");
			break;
		default:
		}
		return matches;
	}



}
