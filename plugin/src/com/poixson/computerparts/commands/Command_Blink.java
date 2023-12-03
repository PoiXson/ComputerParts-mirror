package com.poixson.computerparts.commands;

import static com.poixson.computerparts.ComputerPartsPlugin.CHAT_PREFIX;
import static com.poixson.computerparts.ComputerPartsPlugin.LOG_PREFIX;

import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import com.poixson.pluginlib.tools.commands.pxnCommand;
import com.poixson.computerparts.ComputerPartsPlugin;


public class Command_Blink extends pxnCommand<ComputerPartsPlugin> {



	public Command_Blink(final ComputerPartsPlugin plugin) {
		super(plugin,
			"blink",
			"flash"
		);
	}



	@Override
	public boolean run(final CommandSender sender, final String label, final String[] args) {
		final Player player = (sender instanceof Player ? (Player)sender : null);
		if (player == null) {
			sender.sendMessage(LOG_PREFIX + "Only players can use this command.");
			return true;
		}
		if (!player.hasPermission("computer.blink")) {
			player.sendMessage(CHAT_PREFIX + "You don't have permission to use this.");
			return true;
		}
		this.plugin.toggleBlink(player);
		return true;
	}



}
