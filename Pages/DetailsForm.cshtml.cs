using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using FormsPdfApp.Models;

public class DetailsFormModel : PageModel
{
    public void OnGet() { }

    public IActionResult OnPostSave(string ReeferUnit, string OutsideDoors, string VentilationUnit)
    {
        var det = new DetailsModel { ReeferUnit = ReeferUnit ?? string.Empty, OutsideDoors = OutsideDoors ?? string.Empty, VentilationUnit = VentilationUnit ?? string.Empty };
        HttpContext.Session.Set("OtherData", det);
        return RedirectToPage("/Generate");
    }
}
