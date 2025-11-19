using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using FormsPdfApp.Models;

public class ClientFormModel : PageModel
{
    public void OnGet() { }

    public IActionResult OnPostSave(string Shipper, string Forwarder, string Address)
    {
        var cli = new ClientModel { Shipper = Shipper ?? string.Empty, Forwarder = Forwarder ?? string.Empty, Address = Address ?? string.Empty };
        HttpContext.Session.Set("ClientData", cli);
        return RedirectToPage("/DetailsForm");
    }
}
