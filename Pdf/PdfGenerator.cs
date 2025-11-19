using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using FormsPdfApp.Models;

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
                    page.Size(PageSizes.A4);
                    page.Margin(20);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    page.Header()
                        .Height(120)
                        .AlignCenter()
                        .Padding(5)
                        .Row(row =>
                        {
                            row.RelativeColumn().Image(letter);
                        });

                    page.Content().Column(col =>
                    {
                        col.Spacing(5);
                        col.Item().Text("EMPTY CONTAINER SURVEY REPORT").Bold().FontSize(16).AlignCenter();

                        col.Item().PaddingTop(5).Row(r =>
                        {
                            r.RelativeColumn().Column(c1 =>
                            {
                                c1.Item().Text($"Container No: {s.ContainerNo}");
                                c1.Item().Text($"Set Temp: {s.Temperature}");
                                c1.Item().Text($"Humidity: {s.Humidity}");
                            });
                            r.ConstantColumn(200).Column(c2 =>
                            {
                                c2.Item().Text($"Shipper: {c.Shipper}");
                                c2.Item().Text($"Forwarder: {c.Forwarder}");
                            });
                        });

                        col.Item().PaddingTop(10).Text("Survey Observations:").Bold();
                        col.Item().Text($"Refrigeration Unit (Out Side): {d.ReeferUnit}");
                        col.Item().Text($"Outside Doors: {d.OutsideDoors}");
                        col.Item().Text($"Ventilation Unit: {d.VentilationUnit}");
                    });

                    page.Footer()
                        .Height(100)
                        .AlignRight()
                        .Padding(5)
                        .Column(col =>
                        {
                            col.Item().Text("Authorized Signature:");
                            col.Item().Image(sign).Height(60);
                        });
                });
            });

            return doc.GeneratePdf();
        }
    }
}
