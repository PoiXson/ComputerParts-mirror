package com.poixson.computerparts.listeners;

import java.util.ArrayList;

import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.command.PluginCommand;

import com.poixson.computerparts.ComputerPartsPlugin;


public class ComputerPartsCommands implements CommandExecutor {

	protected final ComputerPartsPlugin plugin;

	protected final ArrayList<PluginCommand> cmds = new ArrayList<PluginCommand>();



	public ComputerPartsCommands (final ComputerPartsPlugin plugin) {
		this.plugin = plugin;
	}



	public void register() {
		final PluginCommand cmd = this.plugin.getCommand("backrooms");
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
		return false;
	}



}
