package com.poixson.computerparts.listeners;

import java.util.ArrayList;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.PluginCommand;
import org.bukkit.entity.Player;

import com.poixson.computerparts.ComputerPartsPlugin;


public class ComputerPartsCommands implements CommandExecutor {
	protected static final String LOG_PREFIX  = ComputerPartsPlugin.LOG_PREFIX;
	protected static final String CHAT_PREFIX = ComputerPartsPlugin.CHAT_PREFIX;

	protected final ComputerPartsPlugin plugin;

	protected final ArrayList<PluginCommand> cmds = new ArrayList<PluginCommand>();



	public ComputerPartsCommands (final ComputerPartsPlugin plugin) {
		this.plugin = plugin;
	}



	public void register() {
		final PluginCommand cmd = this.plugin.getCommand("computer");
		cmd.setExecutor(this);
		this.cmds.add(cmd);
//		cmd.setTabCompleter( new ComputerPartsTabCompleter() );
	}
	public void unregister() {
		for (final PluginCommand cmd : this.cmds) {
			cmd.setExecutor(null);
		}
		this.cmds.clear();
	}



	@Override
	public boolean onCommand(final CommandSender sender, final Command cmd,
			final String label, final String[] args) {
		final Player player = (sender instanceof Player ? (Player)sender : null);
		final int numargs = args.length;
		if (numargs >= 1) {
			switch (args[0]) {
			case "blink": {
				if (player == null) {
					sender.sendMessage(LOG_PREFIX + "Only players can use this command");
					return true;
				}
				if (!player.hasPermission("computer.blink")) {
					player.sendMessage(CHAT_PREFIX+"You don't have permission to use this.");
					return true;
				}
				this.plugin.toggleBlink(player);
				return true;
			}
			default: break;
			}
		}
		return false;
	}



}
