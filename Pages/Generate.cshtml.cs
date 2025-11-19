using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using FormsPdfApp.Models;
using FormsPdfApp.Pdf;

public class GenerateModel : PageModel
{
    public IActionResult OnGet()
    {
        var svc = HttpContext.Session.Get<ServiceModel>("ServiceData") ?? new ServiceModel();
        var cli = HttpContext.Session.Get<ClientModel>("ClientData") ?? new ClientModel();
        var det = HttpContext.Session.Get<DetailsModel>("OtherData") ?? new DetailsModel();

        var webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var pdfBytes = PdfGenerator.Generate(svc, cli, det, webRoot);
        return File(pdfBytes, "application/pdf", "SurveyReport.pdf");
    }
}
