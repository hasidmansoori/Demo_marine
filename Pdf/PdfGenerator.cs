using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using FormsPdfApp.Models;
using System.IO;

namespace FormsPdfApp.Pdf
{
    public static class PdfGenerator
    {
        public static byte[] Generate(ServiceModel s, ClientModel c, DetailsModel d, string webRootPath)
        {
            var letter = Path.Combine(webRootPath, "images", "letterhead.png");
            var sign = Path.Combine(webRootPath, "images", "signature.png");

            var doc = Document.Create(container =>
            {
                container.Page(page =>
                {
                    // Page Settings
                    page.Size(PageSizes.A4);
                    page.Margin(20);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    // HEADER
                    page.Header()
                        .PaddingBottom(10)
                        .Height(120)
                        .AlignCenter()
                        .Element(Header =>
                        {
                            Header.Row(row =>
                            {
                                row.RelativeColumn()
                                    .Height(120)
                                    .Image(letter, ImageScaling.Fit);
                            });
                        });

                    // CONTENT
                    page.Content().Column(col =>
                    {
                        col.Spacing(8);

                        // Title
                        col.Item()
                            .AlignCenter()
                            .Text("EMPTY CONTAINER SURVEY REPORT")
                            .Bold()
                            .FontSize(16);

                        // Row 1 - Container & Shipper Details
                        col.Item().PaddingTop(5).Row(r =>
                        {
                            // LEFT Column
                            r.RelativeColumn().Column(c1 =>
                            {
                                c1.Item().Text($"Container No: {s.ContainerNo}");
                                c1.Item().Text($"Set Temp: {s.Temperature}");
                                c1.Item().Text($"Humidity: {s.Humidity}");
                            });

                            // RIGHT Column
                            r.ConstantColumn(200).Column(c2 =>
                            {
                                c2.Item().Text($"Shipper: {c.Shipper}");
                                c2.Item().Text($"Forwarder: {c.Forwarder}");
                            });
                        });

                        // Survey Observations
                        col.Item().PaddingTop(10).Text("Survey Observations:").Bold();

                        col.Item().Text($"Refrigeration Unit (Outside): {d.ReeferUnit}");
                        col.Item().Text($"Outside Doors: {d.OutsideDoors}");
                        col.Item().Text($"Ventilation Unit: {d.VentilationUnit}");
                    });

                    // FOOTER
                    page.Footer()
                        .PaddingTop(10)
                        .Height(120)
                        .AlignRight()
                        .Column(col =>
                        {
                            col.Item().Text("Authorized Signature:");

                            col.Item()
                                .Height(60)
                                .Width(120)
                                .Image(sign, ImageScaling.Fit);
                        });
                });
            });

            return doc.GeneratePdf();
        }
    }
}
