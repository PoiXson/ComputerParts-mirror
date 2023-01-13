package com.poixson.computerparts.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import com.poixson.commonmc.tools.commands.pxnCommand;
import com.poixson.computerparts.ComputerPartsPlugin;


public class CommandBlink extends pxnCommand {

	protected final ComputerPartsPlugin plugin;

	protected final String logPrefix;
	protected final String chatPrefix;



	public CommandBlink(final ComputerPartsPlugin plugin) {
		super(
			"blink",
			"flash"
		);
		this.plugin = plugin;
		this.logPrefix  = plugin.getLogPrefix();
		this.chatPrefix = plugin.getChatPrefix();
	}



	@Override
	public boolean run(final CommandSender sender,
			final Command cmd, final String[] args) {
		final Player player = (sender instanceof Player ? (Player)sender : null);
		if (player == null) {
			sender.sendMessage(this.logPrefix + "Only players can use this command.");
			return true;
		}
		if (!player.hasPermission("computer.blink")) {
			player.sendMessage(this.chatPrefix + "You don't have permission to use this.");
			return true;
		}
		this.plugin.toggleBlink(player);
		return true;
	}



}
