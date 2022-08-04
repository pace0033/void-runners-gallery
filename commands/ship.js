const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

const colors = {
  Red: "#E74C40",
  Blue: "#1F61AB",
  Green: "#488025",
  Yellow: "#E2B32D",
  White: "#FFFFFF",
};

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
          // Check if the API returns a ship for the ID specified
          if (!response.ok) {
            throw new Error(`No Genesis Fleet ship found with ID ${id}`);
          }
          return response.json();
        }
      );

      // Get the hull from parts array in ship API data
      const hull = ship.parts.find((part) => part.type === "hull").value;

      // Create embed for message reply
      const embed = new MessageEmbed()
        .setColor(colors[ship.stats.registered_color])
        .setTitle(ship.name)
        .setURL(ship.external_url)
        .addFields(
          { name: "Class", value: ship.stats.ship_class, inline: true },
          { name: "Hull", value: hull, inline: true },
          { name: "Colorway", value: ship.stats.colorway, inline: true },
          {
            name: "Capacity",
            value: `${ship.stats.capacity} (${ship.stats.rank_capacity} rank)`,
            inline: true,
          },
          {
            name: "Efficiency",
            value: `${ship.stats.efficiency} (${ship.stats.rank_efficiency} rank)`,
            inline: true,
          },
          {
            name: "Speed",
            value: `${ship.stats.speed} (${ship.stats.rank_speed} rank)`,
            inline: true,
          }
        )
        .setImage(ship.image);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply(error.message);
    }
  },
};
