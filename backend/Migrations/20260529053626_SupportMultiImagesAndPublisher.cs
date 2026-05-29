using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SupportMultiImagesAndPublisher : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Image",
                table: "Ads");

            migrationBuilder.AddColumn<int>(
                name: "PublisherId",
                table: "Ads",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AdImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    AdId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdImages_Ads_AdId",
                        column: x => x.AdId,
                        principalTable: "Ads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Ads_PublisherId",
                table: "Ads",
                column: "PublisherId");

            migrationBuilder.CreateIndex(
                name: "IX_AdImages_AdId",
                table: "AdImages",
                column: "AdId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ads_Users_PublisherId",
                table: "Ads",
                column: "PublisherId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Ads_Users_PublisherId",
                table: "Ads");

            migrationBuilder.DropTable(
                name: "AdImages");

            migrationBuilder.DropIndex(
                name: "IX_Ads_PublisherId",
                table: "Ads");

            migrationBuilder.DropColumn(
                name: "PublisherId",
                table: "Ads");

            migrationBuilder.AddColumn<string>(
                name: "Image",
                table: "Ads",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
