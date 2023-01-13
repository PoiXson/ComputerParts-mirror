package com.poixson.computerparts.commands;

import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import com.poixson.commonmc.tools.commands.pxnCommand;
import com.poixson.computerparts.ComputerPartsPlugin;


public class CommandBlink extends pxnCommand {
	protected static final String LOG_PREFIX  = ComputerPartsPlugin.LOG_PREFIX;
	protected static final String CHAT_PREFIX = ComputerPartsPlugin.CHAT_PREFIX;

	protected final ComputerPartsPlugin plugin;



	public CommandBlink(final ComputerPartsPlugin plugin) {
		super(
			"blink",
			"flash"
		);
		this.plugin = plugin;
	}



	@Override
	public boolean run(final CommandSender sender,
			final Command cmd, final String[] args) {
		final Player player = (sender instanceof Player ? (Player)sender : null);
		if (player == null) {
			sender.sendMessage(LOG_PREFIX+"Only players can use this command.");
			return true;
		}
		if (!player.hasPermission("computer.blink")) {
			player.sendMessage(CHAT_PREFIX+"You don't have permission to use this.");
			return true;
		}
		this.plugin.toggleBlink(player);
		return true;
	}



}
