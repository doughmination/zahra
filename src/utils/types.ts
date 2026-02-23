// Copyright (c) 2026 Clove Twilight
// Licensed under the ESAL-1.3 Licence.
// See LICENCE in the project root for full licence information.

import type {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder | ReturnType<SlashCommandBuilder["setDescription"]>;
  execute(interaction: ChatInputCommandInteraction, client: Client): Promise<void>;
}