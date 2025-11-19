using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using FormsPdfApp.Models;

public class ServiceFormModel : PageModel
{
    public void OnGet() { }

    public IActionResult OnPostSave(string ContainerNo, string Temperature, string Humidity)
    {
        var svc = new ServiceModel { ContainerNo = ContainerNo ?? string.Empty, Temperature = Temperature ?? string.Empty, Humidity = Humidity ?? string.Empty };
        HttpContext.Session.Set("ServiceData", svc);
        return RedirectToPage("/ClientForm");
    }
}
