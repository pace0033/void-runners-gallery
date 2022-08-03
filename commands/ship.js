const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ship")
    .setDescription("Displays a Void Runners Genesis Fleet ship")
    // An option is an input from the user, e.g. to get the ID
    .addIntegerOption((option) =>
      option
        .setName("id")
        .setDescription("The ID for the Void Runners ship to display")
        .setRequired(true)
    ),
  // The function that will be executed on calling the command
  async execute(interaction) {
    // Immediately deferReply() so interaction token doesn't expire during fetch
    await interaction.deferReply();

    // Get user input ID option
    const id = interaction.options.getInteger("id");

    try {
      // Fetch the properties we need for the embed
      const ship = await fetch(`https://voidrunners.io/api/ships/${id}`).then(
        (response) => {
          // Check if the API returns a Gawd for the ID specified
          if (!response.ok) {
            throw new Error(`No Genesis Fleet ship found with ID ${id}`);
          }
          return response.json();
        }
      );

      // Create embed for message reply
      const embed = new MessageEmbed()
        .setColor("#FFFFFF")
        .setTitle(ship.name)
        .setURL(ship.external_url)
        .setImage(ship.image);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply(error.message);
    }
  },
};
